/**
 * Client-side Sentry noise filters.
 *
 * PERDIEMWISE_WEB-1: "TypeError: Cannot add property __isAuthError, object is
 * not extensible", raised from the browser's global `unhandledrejection`
 * handler on /calculators/:slug (8 events, 0 users, Chrome/Windows).
 *
 * `__isAuthError` is a class field that @supabase/auth-js sets on `this` inside
 * the `AuthError` constructor (e.g. every time a signed-out visitor's
 * `getUser()` builds an `AuthSessionMissingError`). Assigning it can only throw
 * if `this`, the object returned by the engine's `Error` constructor, is
 * already non-extensible. Nothing in this app or in Supabase/Next freezes
 * errors, so a patched or hardened `Error` in the visitor's browser (an
 * extension or a lockdown-style script) is the cause: it reproduces only for
 * that environment, not for other browsers on the same release.
 *
 * App code already treats a rejected `getUser()` as "signed out" (AuthNav,
 * useAccountClient) and `addCloudTrip` is wrapped by its caller. What it cannot
 * reach is auth-js's own floating promise: `onAuthStateChange()` runs
 * `_emitInitialSession()` in an un-awaited async IIFE, so when that rejects it
 * is an unhandled rejection no `.catch` of ours can intercept. That is exactly
 * the top frame of the reported stack. It has no user-visible effect (the nav
 * falls back to "Sign in"), so it is filtered rather than left as an
 * unactionable ghost in the backlog.
 *
 * Matches Chrome ("Cannot add property X, object is not extensible") and
 * Firefox ("can't define property "X": Object is not extensible") wording.
 */
export const IGNORED_ERROR_PATTERNS: RegExp[] = [/__isAuthError.*not extensible/i];

/** Whether an error message matches a known, non-actionable client noise pattern. */
export function isIgnoredClientError(message: string | undefined | null): boolean {
  if (!message) return false;
  return IGNORED_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}
