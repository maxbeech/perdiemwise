import assert from "node:assert/strict";
import { POSTS, type Post } from "../lib/posts";

// Regression guard for the FY2027 refresh of three guides (lifecycle pass, 21 Oct 2026).
// Each check names the post, the stale figure it must not contain, and the current one it must.
// Source: GSA FY 2027 per diem highlights (standard CONUS $113 lodging, $68 M&IE; M&IE tiers unchanged).
// https://www.gsa.gov/system/files/FY2027perdiemhighlights.docx

function postText(slug: string): string {
  const post: Post | undefined = POSTS.find((candidate) => candidate.slug === slug);
  assert.ok(post, `${slug} must exist in POSTS`);
  return JSON.stringify(post.body);
}

const howTo = postText("how-to-calculate-per-diem-for-a-business-trip");
assert.ok(!howTo.includes("FY2026"), "how-to-calculate: must not present FY2026 as current");
assert.ok(!howTo.includes("$110 lodging"), "how-to-calculate: stale $110 lodging rate must be gone");
assert.ok(howTo.includes("$113 lodging and $68 M&IE for FY2027"), "how-to-calculate: must state the FY2027 standard rate");
assert.ok(howTo.includes("$577"), "how-to-calculate: worked example total must be $577 ($339 + $238)");

const whatCovers = postText("what-does-per-diem-cover");
assert.ok(!whatCovers.includes("$110 lodging"), "what-does-per-diem-cover: stale $110 lodging rate must be gone");
assert.ok(whatCovers.includes("FY2027 standard $68 M&IE rate"), "what-does-per-diem-cover: M&IE table must be labelled FY2027");

const mie = postText("meals-and-incidentals-mie-breakdown-explained");
assert.ok(!mie.includes("FY2026 M&IE tiers in full"), "meals-and-incidentals: heading must not present FY2026 tiers as current");
assert.ok(mie.includes("FY2027 GSA M&IE breakdown by rate tier"), "meals-and-incidentals: tier table must be labelled FY2027");
assert.ok(mie.includes("not revise the M&IE tiers for FY2027"), "meals-and-incidentals: must state the FY2027 tiers were unchanged, with source");

console.log("fy-rate-currency: all passed");
