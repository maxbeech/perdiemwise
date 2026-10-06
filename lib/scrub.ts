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
export function scrubString(input: string): string {
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
export function scrubValue(value: unknown, depth = 0): unknown {
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
  // A person who chose to send feedback keeps their name, email and message.
  if ((event as { type?: string }).type === "feedback") return event;
  scrubCommon(event);
  for (const ex of event.exception?.values ?? []) {
    if (typeof ex.value === "string") ex.value = scrubString(ex.value);
    for (const frame of ex.stacktrace?.frames ?? []) {
      if (frame.vars) frame.vars = scrubValue(frame.vars) as Record<string, unknown>;
      if (frame.filename) frame.filename = stripQuery(frame.filename);
      if (frame.abs_path) frame.abs_path = stripQuery(frame.abs_path);
    }
  }
  return event;
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

/** Sentry `beforeSend`. */
export const scrubEvent = failClosed(scrubErrorEventUnsafe);
/** Sentry `beforeSendTransaction`. */
export const scrubTransaction = failClosed(scrubTransactionUnsafe);
/** Sentry `beforeBreadcrumb`. */
export const scrubBreadcrumb = failClosed(scrubBreadcrumbUnsafe);
/** Sentry `beforeSendLog`. */
export const scrubLog = failClosed(scrubLogUnsafe);
