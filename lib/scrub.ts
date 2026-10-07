import type * as Sentry from "@sentry/nextjs";
import type { Breadcrumb, ErrorEvent, Log } from "@sentry/nextjs";

// Not re-exported by @sentry/nextjs, so derive it from the option that takes it.
type TransactionEvent = Parameters<NonNullable<NonNullable<Parameters<typeof Sentry.init>[0]>["beforeSendTransaction"]>>[0];

/**
 * The one scrubber every Sentry hook goes through (errors, logs, breadcrumbs,
 * transactions and spans).
 *
 * Three rules, in order of importance:
 *  1. FAIL CLOSED. If scrubbing throws for any reason the event, log or
 *     breadcrumb is dropped. The raw payload is never sent as a fallback.
 *  2. LINEAR TIME. Every pattern uses single, bounded quantifiers with no
 *     nesting or overlap, and strings are cut to MAX_SCAN_CHARS before any
 *     pattern runs, so hostile log text cannot cause catastrophic backtracking.
 *  3. IDS ONLY upstream. This is the safety net, not the policy: callers pass
 *     ids, codes and counts (see lib/observability.ts), never user content.
 *
 * Feedback events are the one exception: the person chose to send their name,
 * email and message, so those are kept.
 */

export const REDACTED = "[redacted]";
/** Longest string we will run patterns over. Anything beyond is cut. */
export const MAX_SCAN_CHARS = 10_000;
const MAX_DEPTH = 6;
const MAX_ARRAY_ITEMS = 50;
const MAX_OBJECT_KEYS = 100;

// Keys whose values never leave the process, matched case-insensitively as
// substrings, so `stripe_secret_key` and `SUPABASE_SERVICE_ROLE_KEY` both hit.
const SECRET_KEYS = [
  "key", "token", "secret", "password", "passwd", "authorization", "cookie", "session",
  "signature", "credential", "dsn", "bearer", "jwt",
];
// Personal data. A traveller's trip details and a bookkeeper's client list are
// not ours to ship to a third party.
const PII_KEYS = [
  "email", "phone", "address", "username", "user.name", "first_name", "last_name", "full_name",
  "firstname", "lastname", "fullname", "postcode", "zip", "ip_address",
  "message_body", "body", "payload", "content", "invite",
];

function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  return SECRET_KEYS.some((s) => k.includes(s)) || PII_KEYS.some((s) => k.includes(s));
}

// All patterns below: single character classes with explicit upper bounds,
// literal separators, no nested quantifiers. Worst case is O(n * bound).
const JWT_RE = /eyJ[\w-]{5,2000}\.[\w-]{5,2000}\.[\w-]{0,2000}/g;
const BEARER_RE = /\bBearer\s{1,5}[\w.~+/=-]{8,2000}/gi;
const API_KEY_RE =
  /(?<![A-Za-z0-9])(?:(?:sk|pk|rk)_[A-Za-z0-9_-]{8,200}|whsec_[A-Za-z0-9_-]{8,200}|hlm_sk_[A-Za-z0-9_-]{8,200}|sntry[su]_[A-Za-z0-9_=-]{8,400}|gh[pousr]_[A-Za-z0-9]{20,200}|github_pat_[A-Za-z0-9_]{20,200}|xox[abprs]-[A-Za-z0-9-]{10,200}|AKIA[A-Z0-9]{12,20}|AIza[A-Za-z0-9_-]{30,60})/g;
const EMAIL_RE = /[A-Za-z0-9._%+-]{1,64}@(?:[A-Za-z0-9-]{1,63}\.){1,8}[A-Za-z]{2,24}/g;
const PHONE_RE = /(?<![\w])\+?\d[\d\s().-]{7,18}\d(?![\w])/g;
// `password=abc`, `"token":"abc"`, `apiKey: abc`, `access_token=abc`, including
// serialised JSON objects. Value is one quoted run or one bare run, both bounded.
const SECRET_PAIR_RE =
  /[\w-]{0,30}(?:password|passwd|secret|token|authorization|api[_-]?key|apikey|credential|cookie|session[_-]?id)[\w-]{0,30}["']?\s{0,3}[:=]\s{0,3}(?:"[^"]{0,500}"|'[^']{0,500}'|[^\s"',;&}]{1,500})/gi;
// A URL followed by its query string or fragment: drop everything after the path.
const URL_QUERY_RE = /\b(https?:\/\/[^\s?#"'<>]{1,2000})[?#][^\s"'<>]{0,2000}/g;

/** Redact secrets and personal data inside free text. Truncates first. */
function scrubStringCore(input: string): string {
  let s = input.length > MAX_SCAN_CHARS ? `${input.slice(0, MAX_SCAN_CHARS)}…[truncated]` : input;
  s = s.replace(URL_QUERY_RE, "$1");
  s = s.replace(JWT_RE, REDACTED);
  s = s.replace(BEARER_RE, `Bearer ${REDACTED}`);
  s = s.replace(API_KEY_RE, REDACTED);
  s = s.replace(SECRET_PAIR_RE, (m) => {
    const sep = m.search(/[:=]/);
    return sep === -1 ? REDACTED : `${m.slice(0, sep + 1)} ${REDACTED}`;
  });
  s = s.replace(EMAIL_RE, REDACTED);
  s = s.replace(PHONE_RE, (m) => {
    const digits = m.replace(/\D/g, "").length;
    return digits >= 9 && digits <= 15 ? REDACTED : m;
  });
  return s;
}

/** Remove the query string and fragment from a URL or path. */
export function stripQuery(url: string): string {
  const cut = url.search(/[?#]/);
  return cut === -1 ? url : url.slice(0, cut);
}

/** Recursively redact: sensitive keys by name, strings by pattern. */
function scrubValueCore(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") return scrubString(value);
  if (typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return REDACTED;
  if (Array.isArray(value)) return value.slice(0, MAX_ARRAY_ITEMS).map((v) => scrubValue(v, depth + 1));
  const out: Record<string, unknown> = {};
  let n = 0;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (++n > MAX_OBJECT_KEYS) break;
    out[k] = isSensitiveKey(k) ? REDACTED : scrubValue(v, depth + 1);
  }
  return out;
}

const URL_KEYS = new Set(["url", "to", "from", "http.url", "url.full", "http.target", "request.url"]);
const QUERY_KEYS = new Set(["http.query", "url.query", "http.fragment", "url.fragment", "query_string", "query"]);

/** scrubValue plus: strip query strings from url-like keys, drop query-only keys. */
function scrubData(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!data) return data;
  const out = scrubValue(data) as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    if (QUERY_KEYS.has(key)) delete out[key];
    else if (URL_KEYS.has(key) && typeof out[key] === "string") out[key] = stripQuery(out[key] as string);
  }
  return out;
}

type Scrubbable = ErrorEvent | TransactionEvent;

function scrubCommon(event: Scrubbable): void {
  if (event.request) {
    if (event.request.url) event.request.url = stripQuery(event.request.url);
    event.request.query_string = undefined;
    delete event.request.cookies;
    delete event.request.data;
    delete (event.request as { env?: unknown }).env;
    if (event.request.headers) event.request.headers = scrubValue(event.request.headers) as Record<string, string>;
  }
  // Ids only: the account holder's identity is never needed to debug a fault.
  if (event.user) event.user = event.user.id ? { id: String(event.user.id) } : undefined;
  if (event.message) event.message = scrubString(event.message);
  if (event.logentry?.message) event.logentry.message = scrubString(event.logentry.message);
  if (event.transaction) event.transaction = scrubString(stripQuery(event.transaction));
  if (event.extra) event.extra = scrubValue(event.extra) as Record<string, unknown>;
  if (event.contexts) event.contexts = scrubValue(event.contexts) as typeof event.contexts;
  if (event.tags) event.tags = scrubValue(event.tags) as typeof event.tags;
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs
      .map((b) => scrubBreadcrumbUnsafe(b))
      .filter((b): b is Breadcrumb => b !== null);
  }
}

function scrubBreadcrumbUnsafe(b: Breadcrumb): Breadcrumb | null {
  return {
    ...b,
    message: typeof b.message === "string" ? scrubString(b.message) : b.message,
    data: scrubData(b.data),
  };
}

function scrubErrorEventUnsafe(event: ErrorEvent): ErrorEvent {
  // A person who chose to send feedback keeps their own name, email and message
  // (contexts.feedback and user) and nothing else: stash those two, run the
  // normal scrub over everything (breadcrumbs, request, tags, extra, other
  // contexts), then restore them. There is deliberately no early return.
  if ((event as { type?: string }).type === "feedback") {
    const feedback = event.contexts?.feedback;
    const user = event.user;
    scrubCommon(event);
    scrubExceptions(event);
    if (feedback) event.contexts = { ...event.contexts, feedback: capFeedback(feedback) } as typeof event.contexts;
    if (user) {
      const { id, email, username, name } = user as Record<string, unknown>;
      event.user = Object.fromEntries(
        Object.entries({ id, email, username, name }).filter(([, v]) => typeof v === "string" || typeof v === "number"),
      ) as typeof event.user;
    }
    return event;
  }
  scrubCommon(event);
  scrubExceptions(event);
  return event;
}

/** Keep only the reporter's own fields, as strings, cut to the scan limit. */
function capFeedback(feedback: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of ["name", "contact_email", "email", "message", "url", "associated_event_id"]) {
    const v = feedback[key];
    if (typeof v === "string") out[key] = v.length > MAX_SCAN_CHARS ? v.slice(0, MAX_SCAN_CHARS) : v;
  }
  return out;
}

function scrubExceptions(event: ErrorEvent): void {
  for (const ex of event.exception?.values ?? []) {
    if (typeof ex.value === "string") ex.value = scrubString(ex.value);
    for (const frame of ex.stacktrace?.frames ?? []) {
      if (frame.vars) frame.vars = scrubValue(frame.vars) as Record<string, unknown>;
      if (frame.filename) frame.filename = stripQuery(frame.filename);
      if (frame.abs_path) frame.abs_path = stripQuery(frame.abs_path);
    }
  }
}

function scrubTransactionUnsafe(event: TransactionEvent): TransactionEvent {
  scrubCommon(event);
  const trace = event.contexts?.trace;
  if (trace?.data) trace.data = scrubData(trace.data) as typeof trace.data;
  if (event.spans) {
    event.spans = event.spans.map((span) => ({
      ...span,
      description: typeof span.description === "string" ? scrubString(span.description) : span.description,
      data: scrubData(span.data) as typeof span.data,
    }));
  }
  return event;
}

function scrubLogUnsafe(log: Log): Log {
  return {
    ...log,
    message: typeof log.message === "string" ? scrubString(log.message) : log.message,
    attributes: log.attributes ? (scrubData(log.attributes as Record<string, unknown>) as Log["attributes"]) : log.attributes,
  };
}

/**
 * Wrap a scrubber so that a throw drops the item instead of leaking it.
 * Exported so tests can prove the behaviour with a deliberately broken scrubber.
 */
export function failClosed<T>(fn: (item: T) => T | null): (item: T) => T | null {
  return (item) => {
    try {
      return fn(item);
    } catch {
      return null;
    }
  };
}

// ---------------------------------------------------------------------------
// Hardening layer (SENTRY_STANDARD section 2). Wraps the pattern table above so
// that bounded-repetition limits, truncation, encodings and per-repo gaps cannot
// leak a secret:
//  1. the string is cut to a safe window FIRST, dropping any half-cut token
//     (a secret's head must never survive a truncation boundary);
//  2. percent-encoded delimiters are decoded so `token%3Dabc` and `Bearer%20abc`
//     match like their plain forms, and URL query strings are dropped;
//  3. long JWTs, bearer tokens, vendor keys and key=value secrets are redacted
//     with open-ended (but still linear-time) patterns, so a secret longer than
//     any bounded limit in the table is redacted whole, not just its first part;
//  4. any run of token characters left glued to a redaction marker (the tail of
//     a secret that overran a bounded pattern) is swallowed into the marker;
//  5. every event / breadcrumb / log gets a second, repo-independent deep pass
//     (secret key names, URL queries, stack-frame vars, spans, contexts) and the
//     wrappers fail closed: a throw drops the item, never sends it raw. A feedback
//     event keeps ONLY the reporter's own contexts.feedback and user.
// ---------------------------------------------------------------------------
const HARDEN_MAX_CHARS = 9_900;
const HARDEN_MARK = "[redacted]";
// Characters a token cannot contain: a cut right after one is a clean cut.
const HARDEN_DELIM_RE = /[\s,;"'()[\]{}<>=:&|/?#\\]/;
// Digits and separators: the head of a phone number must not survive a cut.
const HARDEN_PHONEISH_RE = /[\d\s().+-]/;

/** Cut to the matching budget without leaving the head of a secret behind. */
function hardenWindow(s: string): string {
  if (s.length <= HARDEN_MAX_CHARS) return s;
  let end = HARDEN_MAX_CHARS;
  // Cut landed inside a token: drop the whole partial token.
  if (!HARDEN_DELIM_RE.test(s.charAt(end))) {
    while (end > 0 && !HARDEN_DELIM_RE.test(s.charAt(end - 1))) end--;
  }
  while (end > 0 && HARDEN_PHONEISH_RE.test(s.charAt(end - 1))) end--;
  return end === 0 ? `${HARDEN_MARK}...[truncated]` : `${s.slice(0, end)}...[truncated]`;
}

const HARDEN_PCT_RE = /%(?:40|20|2[BbCcFf]|3[AaDd]|26|22|27)/g;
// No lookbehind anywhere below: older WKWebView / Safari reject it at parse time.
const HARDEN_JWT_RE = /(^|[^A-Za-z0-9])eyJ[\w-]{5,}(?:\.[\w-]*){0,2}/g;
const HARDEN_BEARER_RE = /\bBearer(?:\s|\+){1,4}[\w\-.~+/=%]{8,}/gi;
const HARDEN_KEY_RE =
  /(^|[^A-Za-z0-9])(?:sk|pk|rk|whsec|hlm_sk|hlm_pk|sntrys|sntryu|sbp|sb_secret|sb_publishable|ghp|gho|ghs|ghu|ghr|github_pat|xox[abprs]|AIza)[_-][\w=+/-]{8,}/g;
const HARDEN_AUTH_RE =
  /(\bauthorization["']?\s{0,3}(?:[:=]|%3[AaDd])\s{0,3}\\?["']?)(?!(?:(?:Bearer|Basic|Token|Digest|Negotiate)(?:\s|\+|%20){1,4})?\[[A-Za-z-]{2,12}\](?![\w=+/%~.-]))(?:(?:Bearer|Basic|Token|Digest|Negotiate)(?:\s|\+|%20){1,4})?[^\s,;&}"'\\]+/gi;
const HARDEN_KV_KEY =
  "((?:password|passwd|passphrase|pwd|secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|credential|cookie|signature|jwt|dsn)[\\w.-]{0,30}\\\\?[\"']?\\s{0,3}(?:[:=]|%3[AaDd])\\s{0,3})";
// Quoted values keep their quotes so serialised JSON stays valid.
const HARDEN_KV_ESC_RE = new RegExp(`${HARDEN_KV_KEY}\\\\"(?!\\[[A-Za-z-]{2,12}\\]\\\\")[^"\\\\]*\\\\"`, "gi");
const HARDEN_KV_DQ_RE = new RegExp(`${HARDEN_KV_KEY}"(?!\\[[A-Za-z-]{2,12}\\]")(?:[^"\\\\]|\\\\.)*"`, "gi");
const HARDEN_KV_SQ_RE = new RegExp(`${HARDEN_KV_KEY}'(?!\\[[A-Za-z-]{2,12}\\]')(?:[^'\\\\]|\\\\.)*'`, "gi");
const HARDEN_KV_RAW_RE = new RegExp(`${HARDEN_KV_KEY}(?!\\[[A-Za-z-]{2,12}\\](?![\\w=+/%~.-]))[^\\s,;&}"'\\\\]+`, "gi");
const HARDEN_EMAIL_RE = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63}){1,8}/g;
const HARDEN_URLCRED_RE = /\b([a-z][a-z0-9+.-]{1,15}:\/\/)[^\s/@:]{1,200}:(?!\[[A-Za-z-]{2,12}\]@)[^\s/@]{1,500}@/gi;
const HARDEN_PHONE_RE = /(^|[^\w.-])((?:\+|0)(?![0-9a-f]{7}-[0-9a-f]{4}-)\d[\d\s().-]{7,18}\d)(?![\w])/gi;
const HARDEN_NANP_RE = /(^|[^\w.-])(\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4})(?![\w])/g;
// Query strings and fragments carry capability tokens: keep scheme+host+path only.
const HARDEN_URLQ_RE = /(https?:\/\/[^\s"'<>?#]{1,2000})\?(?!\[[A-Za-z-]{2,12}\](?:$|[\s"'<>]))(?:[^\s"'<>]{0,4000}=\s\[[A-Za-z-]{2,12}\]|[^\s"'<>]{0,4000})/gi;
const HARDEN_PATHQ_RE = /(^|[\s"'(])(\/[^\s"'<>?#]{0,2000})\?(?!\[[A-Za-z-]{2,12}\](?:$|[\s"'<>]))(?:[^\s"'<>]{0,4000}=\s\[[A-Za-z-]{2,12}\]|[^\s"'<>]{0,4000})/g;
// Fragments carry tokens too (OAuth implicit flow, magic links): only a strict routing fragment may stay.
const HARDEN_URLF_RE = /(https?:\/\/[^\s"'<>?#]{1,2000})#(?!\/[A-Za-z0-9_/-]{0,64}(?:$|[\s"'<>]))[^\s"'<>]{0,4000}/gi;
const HARDEN_PATHF_RE = /(^|[\s"'(])(\/[^\s"'<>?#]{0,2000})#(?!\/[A-Za-z0-9_/-]{0,64}(?:$|[\s"'<>]))[^\s"'<>]{0,4000}/g;
const HARDEN_TAIL_RE = /(\[redacted\]|\[[A-Za-z][A-Za-z-]{1,14}\])(?:[\w=+/%~-]|\.(?=\w))+/g;
// Same, when the repo wraps its marker in quotes (`"[redacted]"tail`).
const HARDEN_TAILQ_RE = /(\[redacted\]|\[[A-Za-z][A-Za-z-]{1,14}\])(["']\]?)(?:[\w=+/%~-]|\.(?=\w))+/g;
// A scheme-only redaction (`Authorization: Basic abc...` -> `[redacted] abc...`) leaves the credential itself behind.
const HARDEN_AUTHTAIL_RE = /(\[redacted\])\s{1,4}(?=[A-Za-z0-9+/=._~-]*[0-9])[A-Za-z0-9+/=._~-]{20,}/g;
const HARDEN_DECODE: Record<string, string> = {
  "%40": "@", "%20": " ", "%2b": "+", "%2c": ",", "%2f": "/", "%3a": ":", "%3d": "=", "%26": "&", "%22": '"', "%27": "'",
};

function hardenPre(input: string): string {
  return hardenRedact(input, true);
}

/** Module-private: only the reporter's own feedback message is run with `redactContact` false (secrets still go). */
function hardenRedact(input: string, redactContact: boolean): string {
  // Query strings first: decoding `%20` would otherwise end the URL early and leave the rest behind.
  let s = input.replace(HARDEN_URLQ_RE, "$1").replace(HARDEN_PATHQ_RE, "$1$2").replace(HARDEN_URLF_RE, "$1").replace(HARDEN_PATHF_RE, "$1$2");
  if (s.includes("%")) s = s.replace(HARDEN_PCT_RE, (m) => HARDEN_DECODE[m.toLowerCase()] ?? m);
  return s
    .replace(HARDEN_URLCRED_RE, `$1${HARDEN_MARK}@`)
    .replace(HARDEN_EMAIL_RE, redactContact ? HARDEN_MARK : "$&")
    .replace(HARDEN_JWT_RE, `$1${HARDEN_MARK}`)
    .replace(HARDEN_BEARER_RE, HARDEN_MARK)
    .replace(HARDEN_AUTH_RE, `$1${HARDEN_MARK}`)
    .replace(HARDEN_KEY_RE, `$1${HARDEN_MARK}`)
    .replace(HARDEN_KV_ESC_RE, `$1\\"${HARDEN_MARK}\\"`)
    .replace(HARDEN_KV_DQ_RE, `$1"${HARDEN_MARK}"`)
    .replace(HARDEN_KV_SQ_RE, `$1'${HARDEN_MARK}'`)
    .replace(HARDEN_KV_RAW_RE, `$1${HARDEN_MARK}`)
    .replace(HARDEN_PHONE_RE, (m, pre: string, num: string) => (redactContact && num.replace(/\D/g, "").length >= 9 ? `${pre}${HARDEN_MARK}` : m))
    .replace(HARDEN_NANP_RE, redactContact ? `$1${HARDEN_MARK}` : "$&");
}

function hardenPost(s: string): string {
  return s.replace(HARDEN_TAIL_RE, "$1").replace(HARDEN_TAILQ_RE, "$1$2").replace(HARDEN_AUTHTAIL_RE, "$1");
}

/**
 * Mask secrets, tokens, emails, phone numbers and URL query strings in free text.
 * Extra arguments (modes, options, `true`) are deliberately ignored: nothing a caller passes can switch
 * redaction off. A feedback reporter's own fields are restored at event level instead (see hardenEvent).
 */
export function scrubString(input: string, ..._ignored: unknown[]): string {
  const core = scrubStringCore as (s: string) => string;
  // Cut first, then the repo's own scrubber (its output shapes are unchanged), then the open-ended
  // passes for whatever its bounded patterns missed, then swallow any tail left glued to a marker.
  return hardenPost(hardenPre(core(hardenWindow(input))));
}

// Key names that carry secrets whatever the repo-specific table above says.
const HARDEN_SECRET_KEY_RE =
  /passw(?:or)?d|passwd|pwd|passphrase|secret|token|api[-_. ]?key|apikey|access[-_.]?key|private[-_.]?key|authorization|cookie|credential|signature|dsn|jwt|bearer|session|otp|(?:^|[-_.])(?:auth|key|sig)(?:$|[-_.])/i;

// `api_key_id`, `token_id`: identifiers of a credential, not the credential.
// `auth_method` and friends describe the scheme, they do not carry it.
const HARDEN_ID_KEY_RE = /(?:(?:key|token|secret)[-_.]?ids?|(?:^|[-_.])auth[-_.](?:method|type|provider|mode|scheme|status))$/i;

function hardenIsSecretEntry(k: string, val: unknown): boolean {
  return HARDEN_SECRET_KEY_RE.test(k) && !HARDEN_ID_KEY_RE.test(k) && val != null && typeof val !== "number" && typeof val !== "boolean";
}

/** Recursively redact sensitive values, preserving structure for debugging. */
export function scrubValue(value: unknown, ...rest: unknown[]): unknown {
  const core = scrubValueCore as (v: unknown, ...r: unknown[]) => unknown;
  let v: unknown = value;
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const entries = Object.entries(v as Record<string, unknown>);
    if (entries.some(([k, val]) => hardenIsSecretEntry(k, val))) {
      const copy: Record<string, unknown> = {};
      for (const [k, val] of entries) copy[k] = hardenIsSecretEntry(k, val) ? HARDEN_MARK : val;
      v = copy;
    }
  }
  return core(v, ...rest);
}

type HardenBag = Record<string, unknown>;
type HardenState = { n: number; seen: WeakSet<object> };
const HARDEN_URL_KEYS = new Set(["url", "to", "from", "href", "http.url", "url.full", "http.target", "referrer", "referer", "origin"]);
const HARDEN_QUERY_KEYS = new Set(["url.query", "http.query", "query", "query_string", "http.fragment", "search"]);
const HARDEN_MAX_NODES = 20_000;

function hardenStripQuery(url: string): string {
  // Cut at the first `?` or `#`. Only a strict routing fragment (`#/some/route`) may stay, and never after a query.
  const i = url.search(/[?#]/);
  if (i === -1) return url;
  if (url.charAt(i) === "#" && /^#\/[A-Za-z0-9_/-]{0,64}$/.test(url.slice(i))) return url;
  return url.slice(0, i);
}

/** Deep, idempotent pass: secret keys, URL queries, every string through the scrubber. */
function hardenValue(value: unknown, state: HardenState, depth = 0, key = ""): unknown {
  if (value == null) return value;
  if (typeof value === "string") return scrubString(key && HARDEN_URL_KEYS.has(key) ? hardenStripQuery(value) : value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  if (typeof value !== "object") return undefined; // functions, symbols
  if (value instanceof Date) return value;
  if (state.seen.has(value) || depth > 10 || ++state.n > HARDEN_MAX_NODES) return HARDEN_MARK;
  state.seen.add(value);
  try {
    if (Array.isArray(value)) return value.map((v) => hardenValue(v, state, depth + 1, key));
    const out: HardenBag = {};
    for (const [k, v] of Object.entries(value as HardenBag)) {
      const lk = k.toLowerCase();
      if (HARDEN_QUERY_KEYS.has(lk) && v != null && v !== "") out[k] = HARDEN_MARK;
      else if (!lk.startsWith("sentry.") && hardenIsSecretEntry(k, v)) out[k] = HARDEN_MARK;
      else out[k] = hardenValue(v, state, depth + 1, lk);
    }
    return out;
  } finally {
    state.seen.delete(value);
  }
}

function hardenFresh(): HardenState {
  return { n: 0, seen: new WeakSet<object>() };
}

type HardenReporter = { feedback: HardenBag; user: HardenBag } | undefined;
const HARDEN_REPORTER_FEEDBACK_KEYS = ["name", "email", "contact_email", "message"];
const HARDEN_REPORTER_USER_KEYS = ["email", "name"];

/** The reporter's own words, read from the ORIGINAL feedback event before anything scrubs it. */
function hardenReporter(event: unknown): HardenReporter {
  try {
    const ev = event as HardenBag | null;
    if (!ev || typeof ev !== "object") return undefined;
    const fb = (ev.contexts as HardenBag | undefined)?.feedback;
    if (ev.type !== "feedback" && !fb) return undefined;
    const pick = (src: unknown, keys: string[]): HardenBag => {
      const out: HardenBag = {};
      if (src && typeof src === "object") for (const k of keys) {
        const v = (src as HardenBag)[k];
        if (typeof v === "string") out[k] = k === "message" ? hardenPost(hardenRedact(hardenWindow(v), false)) : v;
      }
      return out;
    };
    return { feedback: pick(fb, HARDEN_REPORTER_FEEDBACK_KEYS), user: pick(ev.user, HARDEN_REPORTER_USER_KEYS) };
  } catch {
    return undefined;
  }
}

/**
 * Second, repo-independent pass over every free-text and structured field of an event. EVERYTHING is
 * scrubbed, feedback events included; afterwards the reporter's own contexts.feedback name/email/message
 * and user email/name are copied back from the original event. Breadcrumbs, request, tags, extra, other
 * contexts and every other field of the same event stay fully scrubbed.
 */
function hardenEvent<T>(event: T, reporter?: HardenReporter): T {
  const ev = event as unknown as HardenBag;
  const st = hardenFresh();
  for (const k of ["message", "logentry", "request", "extra", "tags", "breadcrumbs", "transaction", "spans", "user"]) {
    if (ev[k] != null) ev[k] = hardenValue(ev[k], st, 0, k);
  }
  const contexts = ev.contexts as HardenBag | undefined;
  if (contexts) {
    const trace = contexts.trace as HardenBag | undefined;
    const next: HardenBag = {};
    for (const [ck, cv] of Object.entries(contexts)) {
      if (ck === "trace" && trace) next[ck] = { ...trace, data: hardenValue(trace.data, st, 0, "data") };
      else next[ck] = hardenValue(cv, st, 0, ck);
    }
    ev.contexts = next;
  }
  if (reporter) {
    if (Object.keys(reporter.feedback).length) {
      const ctx = (ev.contexts as HardenBag | undefined) ?? {};
      ctx.feedback = { ...((ctx.feedback as HardenBag | undefined) ?? {}), ...reporter.feedback };
      ev.contexts = ctx;
    }
    if (Object.keys(reporter.user).length) ev.user = { ...((ev.user as HardenBag | undefined) ?? {}), ...reporter.user };
  }
  const exc = ev.exception as { values?: HardenBag[] } | undefined;
  for (const x of exc?.values ?? []) {
    if (typeof x.value === "string") x.value = scrubString(x.value);
    const frames = (x.stacktrace as { frames?: HardenBag[] } | undefined)?.frames ?? [];
    for (const f of frames) if (f.vars != null) f.vars = hardenValue(f.vars, st, 0, "vars");
    const mech = x.mechanism as HardenBag | undefined;
    if (mech?.data != null) mech.data = hardenValue(mech.data, st, 0, "data");
  }
  return event;
}

/** Deep pass for a breadcrumb or log record (message + data/attributes). */
function hardenRecord<T>(rec: T): T {
  return hardenValue(rec, hardenFresh()) as T;
}

/** scrubEvent, then the deep hardening pass. Fails closed: a throw drops the item, never sends it raw. */
export const scrubEvent: typeof scrubEventCore = ((...args: unknown[]) => {
  try {
    const reporter = hardenReporter(args[0]);
    const out = (scrubEventCore as unknown as (...a: unknown[]) => unknown)(...args);
    return out ? hardenEvent(out, reporter) : null;
  } catch {
    return null;
  }
}) as unknown as typeof scrubEventCore;

/** scrubTransaction, then the deep hardening pass. Fails closed: a throw drops the item, never sends it raw. */
export const scrubTransaction: typeof scrubTransactionCore = ((...args: unknown[]) => {
  try {
    const reporter = hardenReporter(args[0]);
    const out = (scrubTransactionCore as unknown as (...a: unknown[]) => unknown)(...args);
    return out ? hardenEvent(out, reporter) : null;
  } catch {
    return null;
  }
}) as unknown as typeof scrubTransactionCore;

/** scrubBreadcrumb, then the deep hardening pass. Fails closed: a throw drops the item, never sends it raw. */
export const scrubBreadcrumb: typeof scrubBreadcrumbCore = ((...args: unknown[]) => {
  try {
    const out = (scrubBreadcrumbCore as unknown as (...a: unknown[]) => unknown)(...args);
    return out ? hardenRecord(out) : null;
  } catch {
    return null;
  }
}) as unknown as typeof scrubBreadcrumbCore;

/** scrubLog, then the deep hardening pass. Fails closed: a throw drops the item, never sends it raw. */
export const scrubLog: typeof scrubLogCore = ((...args: unknown[]) => {
  try {
    const out = (scrubLogCore as unknown as (...a: unknown[]) => unknown)(...args);
    return out ? hardenRecord(out) : null;
  } catch {
    return null;
  }
}) as unknown as typeof scrubLogCore;


/** Sentry `beforeSend`. */
const scrubEventCore = failClosed(scrubErrorEventUnsafe);
/** Sentry `beforeSendTransaction`. */
const scrubTransactionCore = failClosed(scrubTransactionUnsafe);
/** Sentry `beforeBreadcrumb`. */
const scrubBreadcrumbCore = failClosed(scrubBreadcrumbUnsafe);
/** Sentry `beforeSendLog`. */
const scrubLogCore = failClosed(scrubLogUnsafe);
