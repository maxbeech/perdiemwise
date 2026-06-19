import {
  STANDARD_LODGING,
  STANDARD_MIE,
  firstLastForMie,
  getLocation,
  mieAfterMeals,
  tierForMie,
  type GsaLocation,
  type ProvidedMeals,
} from "./gsa";

// Maximum trip length the day-by-day table renders in full; the total is always
// correct, but very long ranges are almost always a date-entry slip.
export const MAX_TRIP_DAYS = 366;

// PerDiemWise per-diem engine — computes a federal-travel per diem the way the
// GSA rules require:
//   • M&IE is paid at 75% on the first and last calendar day of travel and at
//     100% on each full day in between (FTR §301-11.101, GSA M&IE table).
//   • Lodging is paid per night (one night per overnight stay), capped at that
//     location's nightly lodging rate for the month the night falls in.
//   • A location not separately listed by GSA uses the standard CONUS rate.
// All numbers come from lib/gsa-rates.json (real GSA FY2026 data); nothing here
// is fabricated. See /methodology.

export type DayType = "first" | "full" | "last" | "single";

export interface DayLine {
  date: string; // YYYY-MM-DD
  type: DayType;
  lodging: number; // nightly lodging for the night beginning this day (0 on the last/departure day)
  mie: number; // M&IE allowed for this day
}

export interface ResolvedLocation {
  city: string;
  state: string;
  county: string | null;
  mie: number;
  isStandard: boolean;
}

export interface TripResult {
  location: ResolvedLocation;
  days: number;
  nights: number;
  lines: DayLine[];
  lodgingTotal: number;
  mieTotal: number;
  mealsDeducted: number; // total M&IE removed because meals were provided
  total: number;
}

const MS_PER_DAY = 86_400_000;

/** Parse a YYYY-MM-DD date as a UTC calendar day (no timezone drift). */
export function parseDay(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Whole calendar days from start..end inclusive (end >= start). */
export function dayCount(start: string, end: string): number {
  const a = parseDay(start).getTime();
  const b = parseDay(end).getTime();
  return Math.floor((b - a) / MS_PER_DAY) + 1;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Resolve a location slug (or null) to its rates, falling back to standard CONUS. */
export function resolveLocation(slug: string | null): {
  resolved: ResolvedLocation;
  raw: GsaLocation | null;
} {
  const raw = slug ? getLocation(slug) : null;
  if (!raw) {
    return {
      resolved: {
        city: "Standard CONUS rate",
        state: "US",
        county: null,
        mie: STANDARD_MIE,
        isStandard: true,
      },
      raw: null,
    };
  }
  return {
    resolved: {
      city: raw.city,
      state: raw.state,
      county: raw.county,
      mie: raw.mie,
      isStandard: false,
    },
    raw,
  };
}

/** Nightly lodging cap for a given date at a location (or standard CONUS). */
export function lodgingForNight(raw: GsaLocation | null, date: Date): number {
  if (!raw) return STANDARD_LODGING;
  return raw.lodging[date.getUTCMonth()] ?? STANDARD_LODGING;
}

export interface TripInput {
  locationSlug: string | null;
  startDate: string;
  endDate: string;
  providedMeals?: ProvidedMeals;
}

/**
 * Compute a full per-diem trip. Throws if the dates are invalid so callers can
 * show an explicit error rather than a fabricated result.
 */
export function calculateTrip(input: TripInput): TripResult {
  const { locationSlug, startDate, endDate } = input;
  if (!startDate || !endDate) throw new Error("Both a start and end date are required.");
  const start = parseDay(startDate);
  const end = parseDay(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
    throw new Error("Enter valid travel dates.");
  if (end.getTime() < start.getTime())
    throw new Error("The return date cannot be before the departure date.");

  const { resolved, raw } = resolveLocation(locationSlug);
  const days = dayCount(startDate, endDate);
  const fullMie = resolved.mie;
  const firstLastMie = firstLastForMie(fullMie);
  const tier = tierForMie(fullMie);
  const provided = input.providedMeals ?? {};

  const lines: DayLine[] = [];
  let mealsDeducted = 0;

  const pushDay = (date: Date, type: DayType, lodging: number, base: number) => {
    const mie = mieAfterMeals(base, tier, provided);
    mealsDeducted += round2(base - mie);
    lines.push({ date: fmt(date), type, lodging, mie });
  };

  if (days === 1) {
    // Same-day travel (no overnight): 75% M&IE, no lodging.
    pushDay(start, "single", 0, firstLastMie);
  } else {
    for (let i = 0; i < days; i++) {
      const date = new Date(start.getTime() + i * MS_PER_DAY);
      const isFirst = i === 0;
      const isLast = i === days - 1;
      const type: DayType = isFirst ? "first" : isLast ? "last" : "full";
      // Lodging is for the night that begins on this day, so the last
      // (departure) day has no lodging.
      const lodging = isLast ? 0 : lodgingForNight(raw, date);
      pushDay(date, type, lodging, isFirst || isLast ? firstLastMie : fullMie);
    }
  }

  const lodgingTotal = round2(lines.reduce((s, l) => s + l.lodging, 0));
  const mieTotal = round2(lines.reduce((s, l) => s + l.mie, 0));
  return {
    location: resolved,
    days,
    nights: Math.max(0, days - 1),
    lines,
    lodgingTotal,
    mieTotal,
    mealsDeducted: round2(mealsDeducted),
    total: round2(lodgingTotal + mieTotal),
  };
}
