// Canonical/OG base. Defaults to the live Vercel URL so canonicals, sitemaps and
// OG images all resolve TODAY; once the custom domain is connected, set
// NEXT_PUBLIC_SITE_URL=https://perdiemwise.com (inlined at build) and redeploy.
const URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://perdiemwise.vercel.app").replace(/\/$/, "");

export const SITE = {
  name: "PerDiemWise",
  domain: URL.replace(/^https?:\/\//, ""),
  url: URL,
  tagline: "Free GSA per diem & IRS mileage calculator",
  description:
    "Free per diem calculator using the official GSA FY2026 lodging and M&IE rates — with the 75% first-and-last-day rule built in — plus an IRS 2026 mileage reimbursement calculator. Real government rates, itemized day by day.",
  email: "hello@perdiemwise.com",
};

// Single source of truth for the current IRS optional standard mileage rates.
// Source: IRS, "IRS sets 2026 business standard mileage rate at 72.5 cents per
// mile" (released Dec 29, 2025), effective Jan 1, 2026.
export const IRS_MILEAGE_2026 = {
  taxYear: 2026,
  effective: "January 1, 2026",
  sourceUrl:
    "https://www.irs.gov/newsroom/irs-sets-2026-business-standard-mileage-rate-at-725-cents-per-mile-up-25-cents",
  rates: {
    business: 0.725, // 72.5 cents/mile
    medical: 0.205, // 20.5 cents/mile (medical or moving for qualifying members)
    charity: 0.14, // 14 cents/mile (set by statute)
  },
} as const;
