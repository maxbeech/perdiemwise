import * as Sentry from "@sentry/nextjs";

/**
 * The one way code reports a problem, on the server or in the browser.
 *
 * Everything funnels through here so that scope/tag conventions stay
 * consistent across routes, webhooks and components, and so that a deployment
 * with no DSN degrades to a visible console line instead of silence (or a
 * throw inside an error handler, which is how a bug becomes invisible).
 *
 * Context is IDS ONLY. Values that are not short identifier-like strings,
 * numbers or booleans are replaced with a marker, so a caller cannot ship a
 * name, email, free text or request body by accident. The scrubber in
 * lib/scrub.ts is the second line of defence, not the first.
 */

const ID_LIKE = /^[A-Za-z0-9_.:-]{1,80}$/;
const OMITTED = "[omitted: not an id/code/count]";

function safePrimitive(v: unknown): string | number | boolean | null | undefined {
  if (v === null || v === undefined) return v;
  if (typeof v === "number") return Number.isFinite(v) ? v : OMITTED;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ID_LIKE.test(v) ? v : OMITTED;
  return OMITTED;
}

/** Reduce arbitrary context to ids, codes, counts and enum values. */
export function safeContext(context: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(context)) {
    if (k === "scope") continue;
    out[k] = Array.isArray(v) ? v.slice(0, 20).map(safePrimitive) : safePrimitive(v);
  }
  return out;
}

/** Supabase and Stripe errors are often plain objects with a `message`, not Error instances. */
function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (err && typeof err === "object" && typeof (err as { message?: unknown }).message === "string") {
    const e = new Error((err as { message: string }).message);
    const code = (err as { code?: unknown }).code;
    e.name = typeof code === "string" && ID_LIKE.test(code) ? `Error(${code})` : "Error";
    return e;
  }
  return new Error(String(err));
}

function hasDsn(): boolean {
  return Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
}

function scopeOf(context: Record<string, unknown>): string {
  return typeof context.scope === "string" && ID_LIKE.test(context.scope) ? context.scope : "app";
}

/** Report a caught exception as a Sentry Issue. */
export function captureServerError(err: unknown, context: Record<string, unknown> = {}): void {
  const scope = scopeOf(context);
  try {
    if (hasDsn()) {
      Sentry.withScope((s) => {
        s.setTag("scope", scope);
        for (const [k, v] of Object.entries(safeContext(context))) s.setExtra(k, v);
        s.captureException(toError(err));
      });
      return;
    }
  } catch {
    // Never let reporting an error become an error.
  }
  // Reporting is not configured (or failed): say so rather than going quiet.
  console.error(`[${scope}] Sentry not configured, error not reported:`, err instanceof Error ? err.message : err);
}

/** Report a handled failure that is not an exception, such as a rejected upstream response. */
export function captureServerMessage(message: string, context: Record<string, unknown> = {}): void {
  const scope = scopeOf(context);
  try {
    if (hasDsn()) {
      Sentry.withScope((s) => {
        s.setTag("scope", scope);
        s.setLevel("warning");
        for (const [k, v] of Object.entries(safeContext(context))) s.setExtra(k, v);
        s.captureMessage(message);
      });
      return;
    }
  } catch {
    /* see above */
  }
  console.warn(`[${scope}] Sentry not configured, message not reported: ${message}`);
}

type LogLevel = "info" | "warn" | "error";

/** Structured log with ids-only attributes (job runs, webhooks, payments). */
export function logEvent(level: LogLevel, message: string, attributes: Record<string, unknown> = {}): void {
  try {
    Sentry.logger[level](message, safeContext(attributes));
  } catch {
    /* logging must never break the request */
  }
}
