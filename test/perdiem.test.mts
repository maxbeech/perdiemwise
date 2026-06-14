import assert from "node:assert/strict";
import { calculateTrip, dayCount, resolveLocation } from "../lib/perdiem.ts";
import { LOCATIONS, MIE_BREAKDOWN, STANDARD_LODGING, STANDARD_MIE, firstLastForMie, getLocation } from "../lib/gsa.ts";
import { calculateMileage } from "../lib/mileage.ts";
import { US_STATES, locationsInState } from "../lib/states.ts";

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

console.log("GSA dataset integrity");
test("standard rate is $110 lodging / $68 M&IE", () => {
  assert.equal(STANDARD_LODGING, 110);
  assert.equal(STANDARD_MIE, 68);
});
test("298 locations, all with 12 monthly lodging values and a valid M&IE tier", () => {
  assert.equal(LOCATIONS.length, 298);
  const tiers = new Set(MIE_BREAKDOWN.map((t) => t.total));
  for (const l of LOCATIONS) {
    assert.equal(l.lodging.length, 12, `${l.slug} lodging length`);
    assert.ok(l.lodging.every((n) => Number.isFinite(n) && n > 0), `${l.slug} lodging positive`);
    assert.ok(tiers.has(l.mie), `${l.slug} M&IE ${l.mie} is a real tier`);
  }
});
test("location slugs are unique", () => {
  assert.equal(new Set(LOCATIONS.map((l) => l.slug)).size, LOCATIONS.length);
});
test("M&IE first/last day is 75% per the GSA table", () => {
  assert.equal(firstLastForMie(68), 51);
  assert.equal(firstLastForMie(74), 55.5);
  assert.equal(firstLastForMie(80), 60);
  assert.equal(firstLastForMie(86), 64.5);
  assert.equal(firstLastForMie(92), 69);
});

console.log("Per diem engine");
test("same-day trip: 75% M&IE, no lodging", () => {
  const r = calculateTrip({ locationSlug: null, startDate: "2026-03-10", endDate: "2026-03-10" });
  assert.equal(r.days, 1);
  assert.equal(r.nights, 0);
  assert.equal(r.lodgingTotal, 0);
  assert.equal(r.mieTotal, 51);
  assert.equal(r.total, 51);
});
test("2-day standard trip = $110 lodging + $102 M&IE = $212", () => {
  const r = calculateTrip({ locationSlug: null, startDate: "2026-03-10", endDate: "2026-03-11" });
  assert.equal(r.nights, 1);
  assert.equal(r.lodgingTotal, 110);
  assert.equal(r.mieTotal, 102); // 51 + 51
  assert.equal(r.total, 212);
});
test("3-day standard trip = $220 lodging + $170 M&IE = $390", () => {
  const r = calculateTrip({ locationSlug: null, startDate: "2026-03-10", endDate: "2026-03-12" });
  assert.equal(r.lodgingTotal, 220); // 2 nights x 110
  assert.equal(r.mieTotal, 170); // 51 + 68 + 51
  assert.equal(r.total, 390);
});
test("San Francisco 3-day March trip uses $259 lodging + $92 M&IE", () => {
  const sf = getLocation("san-francisco-ca");
  assert.ok(sf, "SF present");
  const r = calculateTrip({ locationSlug: "san-francisco-ca", startDate: "2026-03-10", endDate: "2026-03-12" });
  assert.equal(r.location.isStandard, false);
  assert.equal(r.lodgingTotal, 518); // 2 x 259
  assert.equal(r.mieTotal, 230); // 69 + 92 + 69
  assert.equal(r.total, 748);
});
test("seasonal straddle bills each night at its own month's rate", () => {
  // SF: Aug = $259, Sep = $272
  const r = calculateTrip({ locationSlug: "san-francisco-ca", startDate: "2026-08-31", endDate: "2026-09-02" });
  assert.equal(r.lodgingTotal, 531); // 259 (Aug 31 night) + 272 (Sep 1 night)
  assert.equal(r.mieTotal, 230);
  assert.equal(r.total, 761);
});
test("unknown destination falls back to the standard rate", () => {
  const { resolved } = resolveLocation("not-a-real-city");
  assert.equal(resolved.isStandard, true);
  assert.equal(resolved.mie, 68);
  const r = calculateTrip({ locationSlug: "not-a-real-city", startDate: "2026-03-10", endDate: "2026-03-12" });
  assert.equal(r.location.isStandard, true);
  assert.equal(r.total, 390);
});
test("return before departure throws (explicit error, not a wrong number)", () => {
  assert.throws(() => calculateTrip({ locationSlug: null, startDate: "2026-03-12", endDate: "2026-03-10" }));
});
test("dayCount is inclusive", () => {
  assert.equal(dayCount("2026-03-10", "2026-03-10"), 1);
  assert.equal(dayCount("2026-03-10", "2026-03-12"), 3);
});

console.log("Mileage engine (2026 IRS rates)");
test("240 business miles = $174.00 at 72.5¢", () => {
  assert.equal(calculateMileage([240], "business").amount, 174);
});
test("200 medical miles = $41.00 at 20.5¢", () => {
  assert.equal(calculateMileage([200], "medical").amount, 41);
});
test("100 charitable miles = $14.00 at 14¢", () => {
  assert.equal(calculateMileage([100], "charity").amount, 14);
});
test("multi-leg legs sum before applying the rate", () => {
  const r = calculateMileage([100, 140], "business");
  assert.equal(r.miles, 240);
  assert.equal(r.amount, 174);
});
test("negative / NaN legs are ignored", () => {
  assert.equal(calculateMileage([-5, NaN, 40], "business").amount, 29); // 40 x 0.725
});

console.log("State helpers");
test("50 states + DC, each with a slug", () => {
  assert.equal(US_STATES.length, 51);
  assert.ok(US_STATES.every((s) => s.slug.length > 0));
});
test("locationsInState matches the dataset (e.g. CA has San Francisco)", () => {
  assert.ok(locationsInState("CA").some((l) => l.slug === "san-francisco-ca"));
  assert.equal(locationsInState("CA").length, LOCATIONS.filter((l) => l.state === "CA").length);
});

console.log(`\n${passed} checks passed.`);
