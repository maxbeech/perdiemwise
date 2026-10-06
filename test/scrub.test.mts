import assert from "node:assert/strict";
import {
  MAX_SCAN_CHARS, failClosed, scrubBreadcrumb, scrubEvent, scrubLog, scrubString, scrubTransaction, scrubValue, stripQuery,
} from "../lib/scrub.ts";

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e instanceof Error ? e.stack : e}`);
    process.exitCode = 1;
  }
}

// Built at runtime so secret scanners do not flag this file.
const STRIPE_SK = ["sk", "live", "51Habc123DEFghi456JKLmno"].join("_");
const STRIPE_PK = ["pk", "test", "51Habc123DEFghi456JKLmno"].join("_");
const WHSEC = ["whsec", "abcDEF123456ghiJKL7890"].join("_");
const HELM = ["hlm", "sk", "abcDEF1234567890xyz"].join("_");
const SNTRY = ["sntrys", "eyJpYXQiOjE2ODg"].join("_") + "abcdefghijkl";
const JWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVPmB92K27uhbUJU1p1r";
const SECRETS = [STRIPE_SK, STRIPE_PK, WHSEC, HELM, SNTRY, JWT, "jane.doe+trip@example.co.uk", "+44 7700 900123", "(415) 555-0132"];

function assertClean(text: string) {
  for (const s of SECRETS) assert.ok(!text.includes(s), `leaked ${s.slice(0, 12)}... in: ${text}`);
}

test("redacts emails, phones, tokens and API keys in free text", () => {
  const input = `user jane.doe+trip@example.co.uk called +44 7700 900123 and (415) 555-0132 with Bearer ${JWT} key ${STRIPE_SK} ${STRIPE_PK} ${WHSEC} ${HELM} ${SNTRY}`;
  assertClean(scrubString(input));
});

test("redacts password/secret/token/authorization fields, bare and serialised", () => {
  const out = scrubString(`password=hunter2 token: abc123xyz {"api_key":"zzz999","Authorization":"Basic dXNlcjpwYXNz"} access_token=qqq111`);
  for (const leak of ["hunter2", "abc123xyz", "zzz999", "dXNlcjpwYXNz", "qqq111"]) assert.ok(!out.includes(leak), `${leak} leaked: ${out}`);
});

test("leaves ordinary text and short numbers alone", () => {
  assert.equal(scrubString("Checkout failed for plan pro, 3 retries, status 502"), "Checkout failed for plan pro, 3 retries, status 502");
  assert.equal(scrubString("2026-10-06"), "2026-10-06");
});

test("scrubValue redacts by key and by pattern, recursively and in arrays", () => {
  const out = scrubValue({ userId: "u_1", email: "a@b.com", nested: { password: "x", note: `see ${STRIPE_SK}` }, list: [{ token: "t" }, "me@x.org"] });
  const text = JSON.stringify(out);
  assert.ok(text.includes("u_1"));
  assert.ok(!text.includes("a@b.com") && !text.includes("me@x.org") && !text.includes(STRIPE_SK) && !text.includes('"x"'));
});

test("beforeSend: scrubs message, exception, extras, headers, request body, user, breadcrumbs", () => {
  const ev = scrubEvent({
    type: undefined,
    message: `failed for jane.doe+trip@example.co.uk`,
    exception: { values: [{ type: "Error", value: `bad ${STRIPE_SK} for +44 7700 900123`, stacktrace: { frames: [{ filename: "app.js?token=abc", vars: { password: "p" } }] } }] },
    extra: { stripeKey: STRIPE_SK, idempotency_payload: { email: "a@b.com" }, count: 3 },
    request: { url: "https://x.test/auth/callback?code=SECRET&next=/a#frag", query_string: "code=SECRET", cookies: { a: "b" }, data: { name: "Jane" }, headers: { Authorization: `Bearer ${JWT}`, accept: "*/*" } },
    user: { id: "u_1", email: "jane.doe+trip@example.co.uk", ip_address: "1.2.3.4" },
    breadcrumbs: [{ message: `GET /x ${WHSEC}`, data: { url: "https://x.test/p?token=1", to: "/a?b=1", from: "/c?d=2" } }],
  } as never);
  assert.ok(ev);
  const text = JSON.stringify(ev);
  assertClean(text);
  assert.ok(!text.includes("SECRET") && !text.includes("token=1") && !text.includes("b=1") && !text.includes("Jane") && !text.includes("1.2.3.4"));
  assert.deepEqual(ev.user, { id: "u_1" });
  assert.equal(ev.request?.url, "https://x.test/auth/callback");
  assert.equal(ev.breadcrumbs?.[0].data?.url, "https://x.test/p");
  assert.equal(ev.breadcrumbs?.[0].data?.to, "/a");
  assert.equal(ev.breadcrumbs?.[0].data?.from, "/c");
  assert.equal(ev.extra?.count, 3);
});

test("feedback events keep name and email", () => {
  const fb = { type: "feedback", contexts: { feedback: { name: "Jane", contact_email: "jane@example.com", message: "Lovely tool" } } };
  const out = scrubEvent(fb as never);
  assert.equal(JSON.stringify(out), JSON.stringify(fb));
});

test("beforeBreadcrumb: scrubs message and data, strips query strings", () => {
  const b = scrubBreadcrumb({ category: "console", message: `login ${JWT}`, data: { arguments: [`mail ${"jane.doe+trip@example.co.uk"}`], url: "/account?session_id=cs_live_1", token: "t" } });
  assert.ok(b);
  const text = JSON.stringify(b);
  assertClean(text);
  assert.ok(!text.includes("cs_live_1"));
  assert.equal(b.data?.url, "/account");
});

test("beforeSendTransaction: strips query strings from request url and span data, scrubs descriptions", () => {
  const tx = scrubTransaction({
    type: "transaction",
    transaction: "GET /auth/callback?code=ABC",
    request: { url: "https://x.test/auth/callback?code=ABC" },
    contexts: { trace: { trace_id: "a", span_id: "b", data: { "http.url": "https://x.test/a?code=ABC", "url.query": "code=ABC", "http.query": "?code=ABC" } } },
    spans: [{
      span_id: "c", trace_id: "a", start_timestamp: 1,
      description: `GET https://api.test/v1/x?token=${STRIPE_SK}`,
      data: { "http.url": "https://api.test/v1/x?token=1", "url.full": "https://api.test/v1/x?a=1#h", "url.query": "token=1", "http.query": "token=1", "http.fragment": "#h" },
    }],
  } as never);
  assert.ok(tx);
  const text = JSON.stringify(tx);
  assert.ok(!/ABC|token=|a=1|#h/.test(text), text);
  assertClean(text);
  assert.equal(tx.spans?.[0].data?.["http.url"], "https://api.test/v1/x");
});

test("beforeSendLog: scrubs message and attributes", () => {
  const log = scrubLog({ level: "info", message: `sent to jane.doe+trip@example.co.uk with ${STRIPE_SK}`, attributes: { userId: "u_1", email: "a@b.com", "sentry.sdk.name": "x", note: `Bearer ${JWT}` } });
  assert.ok(log);
  const text = JSON.stringify(log);
  assertClean(text);
  assert.ok(!text.includes("a@b.com"));
  assert.ok(text.includes("u_1") && text.includes("sentry.sdk.name"));
});

test("FAILS CLOSED: a throwing scrubber drops the item, never returns the raw one", () => {
  const boom = failClosed<{ v: string }>(() => { throw new Error("scrub bug"); });
  assert.equal(boom({ v: STRIPE_SK }), null);
  // And the real scrubbers drop on hostile input that makes them throw.
  assert.equal(scrubEvent({ get message(): string { throw new Error("x"); } } as never), null);
  assert.equal(scrubBreadcrumb({ get message(): string { throw new Error("x"); } } as never), null);
  assert.equal(scrubLog({ get message(): string { throw new Error("x"); } } as never), null);
  assert.equal(scrubTransaction({ get request(): never { throw new Error("x"); } } as never), null);
});

test("long adversarial strings are truncated and scrubbed in linear time", () => {
  const cases = [
    "a".repeat(200_000),
    "a@".repeat(100_000),
    "1".repeat(200_000),
    "1 ".repeat(100_000),
    `${"password".repeat(20_000)}=`,
    `eyJ${"a".repeat(200_000)}.`,
    `Bearer ${" ".repeat(200_000)}x`,
    `sk_${"a".repeat(200_000)}`,
    "token=".repeat(50_000),
    `http://${"a".repeat(200_000)}?`,
    "a.".repeat(100_000) + "@",
    `${"-".repeat(100_000)}@a.b`,
  ];
  for (const c of cases) {
    const t0 = performance.now();
    const out = scrubString(c);
    const ms = performance.now() - t0;
    assert.ok(ms < 500, `took ${ms.toFixed(0)}ms for ${c.slice(0, 20)}`);
    assert.ok(out.length <= MAX_SCAN_CHARS + 50, `output not truncated (${out.length})`);
  }
});

test("a secret sitting beyond the cut is dropped with the rest of the tail", () => {
  const out = scrubString(`${"x".repeat(MAX_SCAN_CHARS + 5)} ${STRIPE_SK}`);
  assert.ok(!out.includes(STRIPE_SK) && out.endsWith("[truncated]"));
});

test("stripQuery removes query and fragment", () => {
  assert.equal(stripQuery("/a/b?x=1#y"), "/a/b");
  assert.equal(stripQuery("https://h/p#frag"), "https://h/p");
  assert.equal(stripQuery("/plain"), "/plain");
});

console.log(`\n${passed} scrub checks passed.`);
