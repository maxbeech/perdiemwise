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

/** The first/last-day (75%) M&IE amount for a given M&IE total. */
export function firstLastForMie(mieTotal: number): number {
  const tier = MIE_BREAKDOWN.find((t) => t.total === mieTotal);
  if (tier) return tier.firstLast;
  // Any M&IE total maps to 75%, rounded to the nearest 0.25 like GSA's table.
  return Math.round(mieTotal * 0.75 * 4) / 4;
}

/** The standard CONUS location used whenever a destination is not separately listed. */
export const STANDARD_LOCATION = {
  city: "Standard CONUS rate",
  state: "US",
  lodging: STANDARD_LODGING,
  mie: STANDARD_MIE,
};
