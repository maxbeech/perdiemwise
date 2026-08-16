// Canonical/OG base. Defaults to the live Vercel URL so canonicals, sitemaps and
// OG images all resolve TODAY; once the custom domain is connected, set
// NEXT_PUBLIC_SITE_URL=https://perdiemwise.com (inlined at build) and redeploy.
const URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://perdiemwise.vercel.app").replace(/\/$/, "");

export const SITE = {
  name: "PerDiemWise",
  domain: URL.replace(/^https?:\/\//, ""),
  url: URL,
  tagline: "Free GSA per diem & IRS mileage calculator",
  description:
    "Free per diem calculator using the official GSA FY2026 lodging and M&IE rates — with the 75% first-and-last-day rule built in — plus an IRS 2026 mileage reimbursement calculator. Real government rates, itemized day by day.",
  email: "hello@perdiemwise.com",
  fyShort: "FY2026",
};

// Single source of truth for the IRS optional standard mileage rates. The IRS
// made a rare mid-year adjustment for 2026 (the first since 2022) on top of
// the usual annual rate, so the year is split into two periods rather than
// one flat figure.
// Sources:
//  - IRS, "IRS sets 2026 business standard mileage rate at 72.5 cents per
//    mile" (released Dec 29, 2025), effective Jan 1, 2026.
//  - IRS Announcement 2026-11 (Internal Revenue Bulletin 2026-29, published
//    Jul 9 2026), raising the business rate to 76 cents/mile effective Jul 1
//    2026 in response to a sharp rise in fuel costs.
export interface MileageRatePeriod {
  from: string; // YYYY-MM-DD, inclusive
  to: string; // YYYY-MM-DD, inclusive
  effective: string; // human label
  sourceUrl: string;
  rates: {
    business: number;
    medical: number; // medical or moving, for qualifying Armed Forces members
    charity: number; // set by statute, not the IRS
  };
}

export const IRS_MILEAGE_2026_PERIODS: MileageRatePeriod[] = [
  {
    from: "2026-01-01",
    to: "2026-06-30",
    effective: "January 1, 2026",
    sourceUrl:
      "https://www.irs.gov/newsroom/irs-sets-2026-business-standard-mileage-rate-at-725-cents-per-mile-up-25-cents",
    rates: { business: 0.725, medical: 0.205, charity: 0.14 },
  },
  {
    from: "2026-07-01",
    to: "2026-12-31",
    effective: "July 1, 2026",
    sourceUrl: "https://www.irs.gov/tax-professionals/standard-mileage-rates",
    rates: { business: 0.76, medical: 0.235, charity: 0.14 },
  },
];

/** The mileage rate period covering a given date (defaults to today). Falls
 *  back to the most recent period for dates outside the published ranges. */
export function mileageRateForDate(date: string | Date = new Date()): MileageRatePeriod {
  const iso = typeof date === "string" ? date.slice(0, 10) : date.toISOString().slice(0, 10);
  return (
    IRS_MILEAGE_2026_PERIODS.find((p) => iso >= p.from && iso <= p.to) ??
    IRS_MILEAGE_2026_PERIODS[IRS_MILEAGE_2026_PERIODS.length - 1]
  );
}

// Convenience export for display contexts that just want "the current rate"
// (e.g. marketing copy, the calculator's default view) rather than a specific
// trip date.
export const IRS_MILEAGE_2026 = {
  taxYear: 2026,
  periods: IRS_MILEAGE_2026_PERIODS,
  get current() {
    return mileageRateForDate();
  },
} as const;
