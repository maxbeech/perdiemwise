import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { analyticsPlan, analyticsUserRef, authEventFor, purchaseFromSession, withAuthEvent } from "../lib/analytics-contract.ts";

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e instanceof Error ? e.message : e}`);
    process.exitCode = 1;
  }
}

console.log("OpenHelm analytics contract");
await test("user ref is the first 16 hex chars of SHA-256 (pinned vector)", async () => {
  assert.equal(await analyticsUserRef("00000000-0000-0000-0000-000000000000"), "12b9377cbe7e5c94");
});
await test("user ref never contains the id or an email", async () => {
  const ref = await analyticsUserRef("user@example.com");
  assert.match(ref, /^[0-9a-f]{16}$/);
  assert.ok(!ref.includes("user"));
});
await test("plan is paid for pro and team, free otherwise", () => {
  assert.equal(analyticsPlan("pro"), "paid");
  assert.equal(analyticsPlan("team"), "paid");
  assert.equal(analyticsPlan("free"), "free");
  assert.equal(analyticsPlan(null), "free");
  assert.equal(analyticsPlan(undefined), "free");
});
await test("a sign-in that confirmed the email is a sign_up", () => {
  assert.equal(authEventFor({ email_confirmed_at: "2026-10-01T10:00:00Z", last_sign_in_at: "2026-10-01T10:00:00.400Z" }), "sign_up");
});
await test("a later sign-in is a login", () => {
  assert.equal(authEventFor({ email_confirmed_at: "2026-09-01T10:00:00Z", last_sign_in_at: "2026-10-01T10:00:00Z" }), "login");
});
await test("missing timestamps fall back to login, never sign_up", () => {
  assert.equal(authEventFor({}), "login");
  assert.equal(authEventFor({ email_confirmed_at: null, last_sign_in_at: null }), "login");
});
await test("auth marker keeps an existing query string", () => {
  assert.equal(withAuthEvent("/account", "sign_up"), "/account?oh_auth=sign_up");
  assert.equal(withAuthEvent("/pricing?x=1", "login"), "/pricing?x=1&oh_auth=login");
});
const paid = { id: "cs_1", payment_status: "paid", client_reference_id: "u1", amount_total: 900, currency: "usd" };
await test("a paid session for this user becomes a purchase payload", () => {
  assert.deepEqual(purchaseFromSession(paid, "u1", "pro"), { transaction_id: "cs_1", plan: "pro", currency: "USD", value: 9 });
});
await test("an unpaid session, another user's session or a missing amount is refused", () => {
  assert.equal(purchaseFromSession({ ...paid, payment_status: "unpaid" }, "u1", "pro"), null);
  assert.equal(purchaseFromSession(paid, "someone-else", "pro"), null);
  assert.equal(purchaseFromSession({ ...paid, amount_total: null }, "u1", "pro"), null);
});
await test("purchase payload carries no email or user id", () => {
  const payload = purchaseFromSession(paid, "u1", "team")!;
  assert.deepEqual(Object.keys(payload).sort(), ["currency", "plan", "transaction_id", "value"]);
});

console.log("Event wiring");
const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
await test("every contract event name is GA-valid and sent from the code", () => {
  const contract = read("lib/analytics-contract.ts");
  const body = contract.slice(contract.indexOf("interface AnalyticsEventMap"), contract.indexOf("export type AnalyticsEventName"));
  const names = [...body.matchAll(/^\s{2}([a-z_]+):/gm)].map((m) => m[1]);
  assert.equal(names.length, 14);
  const sources = ["components", "lib", "app"].flatMap((d) => walk(d)).filter((f) => !f.endsWith("analytics-contract.ts")).map(read).join("\n");
  for (const name of names) {
    assert.match(name, /^[a-z][a-z0-9_]{0,39}$/, name);
    assert.ok(sources.includes(`"${name}"`), `${name} is never sent`);
  }
});
await test("nothing pushes a plain array into dataLayer", () => {
  const offenders = ["components", "lib", "app"].flatMap((d) => walk(d)).filter((f) => /dataLayer\.push\(\s*\[/.test(read(f)));
  assert.deepEqual(offenders, []);
});
await test("the checkout route puts the session id in the success url and the plan on the session", () => {
  const route = read("app/api/checkout/route.ts");
  assert.ok(route.includes("session_id={CHECKOUT_SESSION_ID}"));
  assert.ok(route.includes("metadata: { plan: product }"));
});

function walk(dir: string): string[] {
  return readdirSync(new URL(`../${dir}`, import.meta.url)).flatMap((n: string) => {
    const rel = `${dir}/${n}`;
    return statSync(new URL(`../${rel}`, import.meta.url)).isDirectory() ? walk(rel) : /\.(ts|tsx)$/.test(n) ? [rel] : [];
  });
}

console.log(`\n${passed} analytics tests passed`);
