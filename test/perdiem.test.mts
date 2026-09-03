import assert from "node:assert/strict";
import { calculateTrip, dayCount, resolveLocation } from "../lib/perdiem.ts";
import { LOCATIONS, MIE_BREAKDOWN, STANDARD_LODGING, STANDARD_MIE, firstLastForMie, getLocation, tierForMie, mieAfterMeals, mealDeduction } from "../lib/gsa.ts";
import { calculateMileage } from "../lib/mileage.ts";
import { US_STATES, locationsInState } from "../lib/states.ts";
import { buildReport } from "../lib/report.ts";
import { toCsv } from "../lib/csv.ts";
import type { CloudTrip } from "../lib/trips-remote.ts";
import { calculateTruckerPerDiem, TRANSPORTATION_PER_DIEM } from "../lib/truckers.ts";

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

console.log("Mileage engine (2026 IRS rates — split by the Jul 1 mid-year change)");
test("240 business miles = $174.00 at 72.5¢ (Jan-Jun 2026)", () => {
  assert.equal(calculateMileage([240], "business", "2026-03-01").amount, 174);
});
test("240 business miles = $182.40 at 76¢ (Jul-Dec 2026)", () => {
  assert.equal(calculateMileage([240], "business", "2026-08-01").amount, 182.4);
});
test("200 medical miles = $41.00 at 20.5¢ (Jan-Jun 2026)", () => {
  assert.equal(calculateMileage([200], "medical", "2026-03-01").amount, 41);
});
test("200 medical miles = $47.00 at 23.5¢ (Jul-Dec 2026)", () => {
  assert.equal(calculateMileage([200], "medical", "2026-08-01").amount, 47);
});
test("100 charitable miles = $14.00 at 14¢ (fixed by statute, both periods)", () => {
  assert.equal(calculateMileage([100], "charity", "2026-03-01").amount, 14);
  assert.equal(calculateMileage([100], "charity", "2026-08-01").amount, 14);
});
test("multi-leg legs sum before applying the rate", () => {
  const r = calculateMileage([100, 140], "business", "2026-03-01");
  assert.equal(r.miles, 240);
  assert.equal(r.amount, 174);
});
test("negative / NaN legs are ignored", () => {
  assert.equal(calculateMileage([-5, NaN, 40], "business", "2026-03-01").amount, 29); // 40 x 0.725
});

console.log("Transportation-industry per diem (IRS Notice 2025-54)");
test("10 CONUS qualifying days use $80/day and 80% deduction", () => {
  const r = calculateTruckerPerDiem({ startDate: "2026-03-01", endDate: "2026-03-10", region: "conus" });
  assert.equal(r.days, 10);
  assert.equal(r.grossPerDiem, 800);
  assert.equal(r.deductibleAmount, 640);
  assert.equal(r.nonDeductibleAmount, 160);
});
test("OCONUS uses the verified $86 rate", () => {
  const r = calculateTruckerPerDiem({ startDate: "2026-08-01", endDate: "2026-08-02", region: "oconus" });
  assert.equal(r.grossPerDiem, 172);
  assert.equal(r.deductibleAmount, 137.6);
});
test("unverified dates fail explicitly instead of guessing a rate", () => {
  assert.throws(() => calculateTruckerPerDiem({ startDate: "2026-09-30", endDate: "2026-10-01", region: "conus" }), /No verified transportation-industry rate/);
  assert.equal(TRANSPORTATION_PER_DIEM.source, "https://www.irs.gov/pub/irs-drop/n-25-54.pdf");
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

console.log("Provided-meal deductions");
test("tierForMie returns the correct GSA tier", () => {
  assert.equal(tierForMie(68).breakfast, 16);
  assert.equal(tierForMie(92).total, 92);
});
test("mealDeduction sums only the provided meals", () => {
  assert.equal(mealDeduction(tierForMie(68), { lunch: true }), 19);
  assert.equal(mealDeduction(tierForMie(68), { breakfast: true, lunch: true, dinner: true }), 63); // 16+19+28
});
test("mieAfterMeals deducts and never drops below incidentals", () => {
  assert.equal(mieAfterMeals(68, tierForMie(68), { lunch: true }), 49); // 68 - 19
  assert.equal(mieAfterMeals(68, tierForMie(68), { breakfast: true, lunch: true, dinner: true }), 5); // floored at $5 incidental
  assert.equal(mieAfterMeals(51, tierForMie(68), { dinner: true }), 23); // 75% day 51 - 28
});
test("trip with lunch provided reduces M&IE by the lunch value each day", () => {
  const r = calculateTrip({ locationSlug: null, startDate: "2026-03-10", endDate: "2026-03-12", providedMeals: { lunch: true } });
  // day1 51-19=32, day2 68-19=49, day3 51-19=32 → 113 M&IE; lodging unchanged 220
  assert.equal(r.mieTotal, 113);
  assert.equal(r.mealsDeducted, 57); // 3 x 19
  assert.equal(r.lodgingTotal, 220);
  assert.equal(r.total, 333);
});
test("no provided meals = zero deduction (back-compat)", () => {
  const r = calculateTrip({ locationSlug: null, startDate: "2026-03-10", endDate: "2026-03-12" });
  assert.equal(r.mealsDeducted, 0);
  assert.equal(r.total, 390);
});

console.log("Expense-report builder (Pro export)");
const trip = (over: Partial<CloudTrip> & { data: Record<string, unknown> }): CloudTrip => ({
  id: over.id ?? "t1", kind: over.kind ?? "perdiem", name: over.name ?? "Trip", total: over.total ?? 0,
  data: over.data, created_at: "2026-01-01T00:00:00Z",
});
test("per-diem trips are recomputed against live GSA data, not the stored total", () => {
  const r = buildReport([trip({ total: 999999, data: { locationSlug: null, locationLabel: "Standard", start: "2026-03-10", end: "2026-03-12" } })]);
  assert.equal(r.perDiem.length, 1);
  assert.equal(r.perDiem[0].result.total, 390); // recomputed, ignores the bogus 999999
  assert.equal(r.perDiemTotal, 390);
  assert.equal(r.grandTotal, 390);
});
test("mileage trips compute amount = miles × today's IRS rate", () => {
  // Saved mileage trips have no stored date, so buildReport always prices them
  // at today's rate. This assertion assumes "today" falls on or after the Jul 1
  // 2026 mid-year change (76¢); update if the test suite is still running once
  // 2027 rates supersede these.
  const r = buildReport([trip({ kind: "mileage", data: { miles: 240, category: "business" } })]);
  assert.equal(r.mileage.length, 1);
  assert.equal(r.mileage[0].amount, 182.4); // 240 × 0.76
  assert.equal(r.mileageTotal, 182.4);
});
test("mixed report sums per-diem + mileage into the grand total", () => {
  const r = buildReport([
    trip({ id: "a", data: { locationSlug: null, start: "2026-03-10", end: "2026-03-12" } }),
    trip({ id: "b", kind: "mileage", data: { miles: 100, category: "charity" } }),
  ]);
  assert.equal(r.grandTotal, 390 + 14);
});
test("invalid per-diem rows are skipped, never fabricated", () => {
  const r = buildReport([trip({ data: { locationSlug: null, start: "", end: "" } })]);
  assert.equal(r.perDiem.length, 0);
  assert.equal(r.grandTotal, 0);
});
test("trucker rows contribute only their verified deductible amount", () => {
  const r = buildReport([trip({ kind: "trucker", total: 999, data: { start: "2026-03-01", end: "2026-03-10", region: "conus", days: 10, gross: 800, deductible: 640 } })]);
  assert.equal(r.trucker.length, 1);
  assert.equal(r.truckerTotal, 640);
  assert.equal(r.grandTotal, 640);
});

console.log("CSV export");
test("escapes quotes, commas and newlines", () => {
  const csv = toCsv(["A", "B"], [["he said \"hi\"", "x,y"], ["line1\nline2", "z"]]);
  assert.ok(csv.includes('"he said ""hi"""'));
  assert.ok(csv.includes('"x,y"'));
  assert.ok(csv.includes('"line1\nline2"'));
});
test("defuses CSV-injection formula triggers", () => {
  const csv = toCsv(["X"], [["=SUM(A1:A9)"], ["+1"], ["@cmd"]]);
  assert.ok(csv.includes("'=SUM(A1:A9)"));
  assert.ok(csv.includes("'+1"));
  assert.ok(csv.includes("'@cmd"));
});

console.log(`\n${passed} checks passed.`);
