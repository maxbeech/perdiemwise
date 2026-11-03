/**
 * PerDiemWise has no vitest, so the shared browser-noise rules
 * (lib/sentry-client-noise.ts, generated from ProductFactory/_services) are
 * checked here with node:assert, as the rest of this suite is. The full
 * contract lives beside the canonical copy; this covers PERDIEMWISE_WEB-5
 * and that the rules are wired into both Sentry hooks.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CLIENT_NOISE_IGNORE_ERRORS, isClientNoiseEvent, dropClientNoise } from "../lib/sentry-client-noise.ts";

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

const page = { translated: false };
const rejection = (value: string) => ({
  exception: { values: [{ value, mechanism: { type: "auto.browser.global_handlers.onunhandledrejection" }, stacktrace: null }] },
});

test("drops the in-app webview bridge rejection (PERDIEMWISE_WEB-5)", () => {
  const value = "Non-Error promise rejection captured with value: Object Not Found Matching Id:2, MethodName:update, ParamCount:4";
  assert.equal(isClientNoiseEvent(rejection(value), page), true);
  assert.ok(CLIENT_NOISE_IGNORE_ERRORS.some((p) => p.test(value)));
});

test("keeps a rejection that only resembles it", () => {
  assert.equal(isClientNoiseEvent(rejection("Non-Error promise rejection captured with value: Object Not Found"), page), false);
});

test("dropClientNoise skips the wrapped hook for noise and passes real events", () => {
  let calls = 0;
  const wrapped = dropClientNoise((e: { message?: string }) => (calls++, e));
  assert.equal(wrapped({ message: "Failed to connect to MetaMask" }), null);
  assert.equal(calls, 0);
  const real = { message: "Checkout failed" };
  assert.equal(wrapped(real), real);
});

test("is wired into the client init and the shared beforeSend", () => {
  const client = readFileSync(new URL("../instrumentation-client.ts", import.meta.url), "utf8");
  assert.ok(client.includes("...CLIENT_NOISE_IGNORE_ERRORS") && client.includes("denyUrls: CLIENT_NOISE_DENY_URLS"));
  const options = readFileSync(new URL("../lib/sentry-options.ts", import.meta.url), "utf8");
  assert.ok(options.includes("dropClientNoise(scrubEvent)"));
});

console.log(`\n${passed} client-noise checks passed.`);
