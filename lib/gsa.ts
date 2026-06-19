import rates from "./gsa-rates.json";

// Typed accessors over the real GSA FY2026 CONUS per diem dataset
// (lib/gsa-rates.json — see /methodology for provenance). This module is the
// single source of truth for rate lookups across the site and the calculator.

export interface MieTier {
  total: number;
  breakfast: number;
  lunch: number;
  dinner: number;
  incidental: number;
  firstLast: number; // 75% of total, per the GSA first/last travel-day rule
}

export interface GsaLocation {
  slug: string;
  city: string;
  state: string; // 2-letter code
  county: string | null;
  lodging: number[]; // 12 monthly caps, index 0 = January … 11 = December
  mie: number; // M&IE tier total for this location
}

export const FISCAL_YEAR: number = rates.fiscalYear;
export const FISCAL_YEAR_LABEL: string = rates.fiscalYearLabel;
export const GSA_SOURCE = {
  name: rates.source,
  url: rates.sourceUrl,
  api: rates.apiSource,
  fetched: rates.fetched,
};

export const STANDARD_LODGING: number = rates.standardLodging;
export const STANDARD_MIE: number = rates.standardMie;
export const MIE_BREAKDOWN: MieTier[] = rates.mieBreakdown as MieTier[];
export const LOCATIONS: GsaLocation[] = rates.locations as GsaLocation[];

const BY_SLUG = new Map(LOCATIONS.map((l) => [l.slug, l]));

export function getLocation(slug: string): GsaLocation | null {
  return BY_SLUG.get(slug) ?? null;
}

/** The M&IE tier for a given total (every GSA location maps to one of five tiers). */
export function tierForMie(mieTotal: number): MieTier {
  const tier = MIE_BREAKDOWN.find((t) => t.total === mieTotal);
  if (tier) return tier;
  // Fallback for any non-standard total: derive a proportional breakdown.
  return {
    total: mieTotal,
    breakfast: Math.round(mieTotal * 0.23),
    lunch: Math.round(mieTotal * 0.28),
    dinner: Math.round(mieTotal * 0.41),
    incidental: 5,
    firstLast: Math.round(mieTotal * 0.75 * 4) / 4,
  };
}

/** The first/last-day (75%) M&IE amount for a given M&IE total. */
export function firstLastForMie(mieTotal: number): number {
  return tierForMie(mieTotal).firstLast;
}

export interface ProvidedMeals {
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
}

/** Dollar value of the meals provided to a traveller for one day at a tier. */
export function mealDeduction(tier: MieTier, provided: ProvidedMeals): number {
  let d = 0;
  if (provided.breakfast) d += tier.breakfast;
  if (provided.lunch) d += tier.lunch;
  if (provided.dinner) d += tier.dinner;
  return d;
}

/**
 * M&IE payable for one day after deducting any provided meals. Per GSA rules,
 * a provided meal is deducted from the day's M&IE; the incidental portion is
 * always retained, so the result never drops below it.
 */
export function mieAfterMeals(baseMie: number, tier: MieTier, provided: ProvidedMeals): number {
  const after = baseMie - mealDeduction(tier, provided);
  return Math.max(tier.incidental, Math.round(after * 100) / 100);
}

/** The standard CONUS location used whenever a destination is not separately listed. */
export const STANDARD_LOCATION = {
  city: "Standard CONUS rate",
  state: "US",
  lodging: STANDARD_LODGING,
  mie: STANDARD_MIE,
};
