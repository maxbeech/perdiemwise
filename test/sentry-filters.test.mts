import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { IGNORED_ERROR_PATTERNS, isIgnoredClientError } from "../lib/sentry-filters.ts";

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e instanceof Error ? e.message : e}`);
    process.exitCode = 1;
  }
}

test("filters the frozen-error auth-js rejection (PERDIEMWISE_WEB-1)", () => {
  assert.equal(isIgnoredClientError("Cannot add property __isAuthError, object is not extensible"), true);
  assert.equal(isIgnoredClientError("TypeError: Cannot add property __isAuthError, object is not extensible"), true);
  assert.equal(isIgnoredClientError(`can't define property "__isAuthError": Object is not extensible`), true);
});

test("the filter matches what Sentry sees for a real frozen-error failure", () => {
  // Reproduce the mechanism: a base Error whose instances are non-extensible,
  // then a class field assigned in the constructor, as AuthError does.
  class FrozenBase extends Error {
    constructor(m: string) {
      super(m);
      Object.preventExtensions(this);
    }
  }
  class AuthErrorLike extends FrozenBase {
    constructor(m: string) {
      super(m);
      (this as unknown as Record<string, unknown>).__isAuthError = true;
    }
  }
  (function () {
    "use strict";
    try {
      new AuthErrorLike("Auth session missing!");
      assert.fail("expected the constructor to throw");
    } catch (e) {
      assert.ok(e instanceof TypeError);
      assert.equal(isIgnoredClientError((e as Error).message), true, (e as Error).message);
    }
  })();
});

test("leaves real errors alone, including other auth and extensibility errors", () => {
  assert.equal(isIgnoredClientError("AuthApiError: Invalid login credentials"), false);
  assert.equal(isIgnoredClientError("AuthSessionMissingError: Auth session missing!"), false);
  assert.equal(isIgnoredClientError("TypeError: Cannot add property foo, object is not extensible"), false);
  assert.equal(isIgnoredClientError("TypeError: Failed to fetch"), false);
});

test("handles missing input rather than throwing", () => {
  assert.equal(isIgnoredClientError(undefined), false);
  assert.equal(isIgnoredClientError(null), false);
  assert.equal(isIgnoredClientError(""), false);
});

test("is wired into the client Sentry.init", () => {
  const src = readFileSync(new URL("../instrumentation-client.ts", import.meta.url), "utf8");
  assert.ok(src.includes("ignoreErrors: IGNORED_ERROR_PATTERNS"));
  assert.ok(IGNORED_ERROR_PATTERNS.length > 0);
});

console.log(`\n${passed} sentry-filter checks passed.`);
