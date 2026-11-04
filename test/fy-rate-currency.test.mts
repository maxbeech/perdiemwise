import assert from "node:assert/strict";
import { POSTS, type Post } from "../lib/posts";

// Regression guard for the FY2027 refresh of three guides (lifecycle pass, 21 Oct 2026)
// and of four more posts (lifecycle pass, 27 Oct 2026; see the checks at the end of this file).
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

const firstLast = postText("gsa-per-diem-first-and-last-day-75-percent-rule");
assert.ok(!firstLast.includes("FY2026 M&IE first/last-day"), "75-percent-rule: FY2026 tier table must not be presented as current");
assert.ok(firstLast.includes("FY2027 M&IE first/last-day rate by tier"), "75-percent-rule: tier table must be labelled FY2027");

const mealsDeducted = postText("are-provided-meals-deducted-from-per-diem");
assert.ok(!mealsDeducted.includes("GSA FY2026 M&IE breakdown"), "provided-meals: FY2026 breakdown label must be gone");
assert.ok(mealsDeducted.includes("GSA FY2027 M&IE breakdown by daily rate tier"), "provided-meals: tier table must be labelled FY2027");

const mileageVsPerDiem = postText("per-diem-vs-mileage-reimbursement");
assert.ok(!mileageVsPerDiem.includes("$110/night"), "per-diem-vs-mileage: stale $110/night standard rate must be gone");
assert.ok(!mileageVsPerDiem.includes("$314.80"), "per-diem-vs-mileage: stale $314.80 combined total must be gone");
assert.ok(mileageVsPerDiem.includes("$113 a night for lodging"), "per-diem-vs-mileage: must state the FY2027 standard rate");
assert.ok(mileageVsPerDiem.includes("$317.80"), "per-diem-vs-mileage: worked example total must be $317.80 ($136.80 + $113 + $68)");
assert.ok(mileageVsPerDiem.includes("$308.50"), "per-diem-vs-mileage: pre-July FY2026 example ($308.50) must be kept, labelled FY2026");

const policyExample = postText("per-diem-policy-example");
assert.ok(!policyExample.includes("$110"), "policy-example: stale $110 lodging rate must be gone");
assert.ok(policyExample.includes("$113 lodging / $68 M&IE, FY2027"), "policy-example: unlisted-destination row must state the FY2027 standard rate");

// Lifecycle pass, 4 Nov 2026: three more posts. Stale FY2026 figures must not read as current.
const gsaExplained = postText("gsa-per-diem-rates-explained");
assert.ok(!gsaExplained.includes("$110/night lodging"), "gsa-explained: stale $110/night TL;DR must be gone");
assert.ok(!gsaExplained.includes("roughly 296"), "gsa-explained: stale 296 NSA count must be gone");
assert.ok(gsaExplained.includes("$113/night lodging and $68/day M&IE for FY2027"), "gsa-explained: TL;DR must state the FY2027 standard rate");
assert.ok(gsaExplained.includes("$113 a night for lodging"), "gsa-explained: body must state the FY2027 standard lodging rate");
assert.ok(gsaExplained.includes("295"), "gsa-explained: must state the FY2027 NSA count (295)");
assert.ok(!gsaExplained.includes("The FY2026 M&IE tiers"), "gsa-explained: M&IE heading must not present FY2026 tiers as current");
assert.ok(!gsaExplained.includes("Why rates were frozen for FY2026"), "gsa-explained: frozen-rates heading must be reworded for FY2027");

const oconus = postText("oconus-vs-conus-per-diem");
assert.ok(!oconus.includes("$110"), "oconus-vs-conus: stale $110 lodging rate must be gone");
assert.ok(oconus.includes("$113 a night for lodging"), "oconus-vs-conus: must state the FY2027 standard rate");
assert.ok(oconus.includes("$113 lodging / $68 M&IE for FY2027"), "oconus-vs-conus: territory row must state the FY2027 standard rate");

const lodgingSeason = postText("lodging-rates-change-by-season");
assert.ok(!lodgingSeason.includes("runs $259"), "lodging-season: present-tense FY2026 San Francisco cap must be gone");
assert.ok(lodgingSeason.includes("FY2026 lodging cap was $259"), "lodging-season: San Francisco cap must be labelled as the FY2026 figure");
assert.ok(lodgingSeason.includes("FY2027 rates took effect on 1 October 2026"), "lodging-season: must state FY2027 rates now apply");

console.log("fy-rate-currency: all passed");
