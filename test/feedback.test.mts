import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as FeedbackModule from "../components/FeedbackButton.tsx";
import { openFeedback, type SentryFeedbackApi } from "../lib/feedback.ts";
import { captureServerError, safeContext } from "../lib/observability.ts";

// tsx exposes the default export of a CJS-interop module one level down.
const FeedbackButton = ((FeedbackModule as { default: unknown }).default as { default?: unknown }).default ?? (FeedbackModule as { default: unknown }).default;
let passed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e instanceof Error ? e.stack : e}`);
    process.exitCode = 1;
  }
}

function fakeSentry(configured = true) {
  const calls: string[] = [];
  const users: unknown[] = [];
  let overrides: Record<string, () => void> = {};
  const api: SentryFeedbackApi = {
    getFeedback: () => configured ? { createForm: async (o) => { overrides = (o ?? {}) as typeof overrides; calls.push("create"); return { appendToDom: () => calls.push("append"), open: () => calls.push("open") }; } } : undefined,
    setUser: (u) => { users.push(u); },
  };
  return { api, calls, users, close: () => overrides.onFormClose?.() };
}

await test("every variant renders a labelled control", () => {
  for (const variant of ["header", "menu", "footer"] as const) {
    const html = renderToStaticMarkup(createElement(FeedbackButton as never, { variant }));
    assert.match(html, /<button[^>]*type="button"/);
    assert.match(html, /Send feedback/);
  }
});

await test("the header and the footer both carry the control", () => {
  const layout = readFileSync("app/layout.tsx", "utf8");
  assert.ok((layout.match(/<FeedbackButton/g) ?? []).length >= 3, "header, mobile menu and footer");
  assert.ok(layout.includes('variant="footer"') && layout.includes('variant="menu"'));
});

await test("opens the Sentry form and pre-fills a signed-in user", async () => {
  const s = fakeSentry();
  assert.equal(await openFeedback(s.api, { id: "u_1", email: "jane@example.com", name: "Jane" }), "opened");
  assert.deepEqual(s.calls, ["create", "append", "open"]);
  assert.deepEqual(s.users[0], { id: "u_1", email: "jane@example.com", username: "Jane" });
});

await test("drops the email from the Sentry user once the form closes", async () => {
  const s = fakeSentry();
  await openFeedback(s.api, { id: "u_1", email: "jane@example.com" });
  s.close();
  assert.deepEqual(s.users.at(-1), { id: "u_1" });
});

await test("signed-out visitors open the form with no identity set", async () => {
  const s = fakeSentry();
  assert.equal(await openFeedback(s.api, null), "opened");
  assert.deepEqual(s.users, []);
});

await test("reports unavailable when no DSN is configured, rather than doing nothing", async () => {
  assert.equal(await openFeedback(fakeSentry(false).api, null), "unavailable");
});

await test("client init uses our own button, the tunnel header fix, and not the injected widget", () => {
  const src = readFileSync("instrumentation-client.ts", "utf8");
  assert.ok(src.includes("autoInject: false"));
  assert.ok(src.includes('"content-type": "application/x-sentry-envelope"'));
  assert.ok(!src.includes("autoInject: true"));
});

await test("safeContext keeps ids, codes, counts, booleans and drops content", () => {
  const out = safeContext({
    scope: "x", userId: "9b1d6f0e-1c2a-4d5e-8f90-123456789abc", count: 3, ok: true, code: "resource_missing",
    email: "a@b.com", name: "Jane Doe", note: "free text with spaces", body: { a: 1 }, ids: ["a", "b c"], big: Number.NaN,
  });
  assert.equal(out.userId, "9b1d6f0e-1c2a-4d5e-8f90-123456789abc");
  assert.equal(out.count, 3);
  assert.equal(out.ok, true);
  assert.equal(out.code, "resource_missing");
  assert.equal("scope" in out, false);
  for (const k of ["email", "name", "note", "body", "big"]) assert.match(String(out[k]), /omitted/, k);
  assert.deepEqual(out.ids, ["a", "[omitted: not an id/code/count]"]);
});

await test("captureServerError without a DSN logs visibly and never throws", () => {
  const saved = { a: process.env.SENTRY_DSN, b: process.env.NEXT_PUBLIC_SENTRY_DSN };
  delete process.env.SENTRY_DSN; delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  const orig = console.error; const lines: string[] = [];
  console.error = (...a: unknown[]) => { lines.push(a.join(" ")); };
  try {
    captureServerError(new Error("boom"), { scope: "test" });
  } finally {
    console.error = orig;
    if (saved.a) process.env.SENTRY_DSN = saved.a;
    if (saved.b) process.env.NEXT_PUBLIC_SENTRY_DSN = saved.b;
  }
  assert.equal(lines.length, 1);
  assert.match(lines[0], /\[test\].*not configured/);
});

await test("every former swallow site now reports through captureServerError", () => {
  const sites = [
    "app/api/checkout/route.ts", "app/api/stripe/portal/route.ts", "app/api/stripe/webhook/route.ts",
    "app/api/team/route.ts", "app/api/team/invite/route.ts", "app/api/team/invite/accept/route.ts",
    "app/api/team/[id]/trips/route.ts", "app/account/page.tsx", "app/account/CloudTrips.tsx", "lib/report.ts",
    "components/UpgradePanel.tsx", "components/TeamUpgradePanel.tsx", "components/ManageBillingButton.tsx",
    "components/SaveToAccountButton.tsx", "components/TeamWorkspace.tsx",
  ];
  for (const f of sites) assert.ok(readFileSync(f, "utf8").includes("captureServerError("), f);
});

await test("instrumentation wires the shared scrubbed options and onRequestError", () => {
  const inst = readFileSync("instrumentation.ts", "utf8");
  assert.ok(inst.includes("sharedSentryOptions()") && inst.includes("onRequestError"));
  const opts = readFileSync("lib/sentry-options.ts", "utf8");
  for (const needle of ["beforeSend: scrubEvent", "beforeSendTransaction", "beforeBreadcrumb", "beforeSendLog", "enableLogs: true", "consoleLoggingIntegration"]) {
    assert.ok(opts.includes(needle), needle);
  }
  assert.ok(readFileSync("next.config.ts", "utf8").includes("tunnelRoute: true"));
});

console.log(`\n${passed} feedback/observability checks passed.`);
