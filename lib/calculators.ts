// Calculator definitions drive the /calculators hub and each /calculators/[slug]
// page. The `tool` key selects which interactive component the page renders, and
// each page foregrounds its own topic (title/intro/keyword) so it is a distinct,
// relevant landing page rather than one generic calculator repeated.

export type ToolKey = "perdiem" | "mileage" | "mie" | "trucker";

export interface Calc {
  slug: string;
  tool: ToolKey;
  title: string;
  h1: string;
  keyword: string;
  description: string;
  intro: string;
  about: string[];
  faq: { q: string; a: string }[];
}

export const CALCS: Calc[] = [
  {
    slug: "truck-driver-per-diem-calculator",
    tool: "trucker",
    title: "Truck Driver Per Diem Calculator (IRS 2025–26 rate)",
    h1: "Truck Driver Per Diem Calculator",
    keyword: "truck driver per diem calculator",
    description: "Calculate the verified IRS transportation-industry per diem for DOT-regulated truck drivers: $80 CONUS or $86 OCONUS, with the 80% deduction applied.",
    intro: "Log qualifying days away from home using the IRS special transportation-industry rate. This is separate from the GSA employer reimbursement table and applies only to workers subject to DOT hours-of-service rules.",
    about: [
      "The IRS publishes a separate, flat per diem rate specifically for workers in the transportation industry who are subject to Department of Transportation hours-of-service rules — truck drivers, bus drivers, and certain rail and airline crew. It's a single national figure, not the city-by-city GSA table used for ordinary business travel.",
      "For the current verified period, the rate is $80 per day for travel within the continental United States (CONUS) and $86 per day for travel outside it (OCONUS). Only 80% of that daily amount is deductible on a tax return, reflecting the standard partial-deduction limit that applies to this specific transportation-industry allowance.",
      "This calculator counts your qualifying days away from home and applies the correct CONUS or OCONUS rate with the 80% deduction built in, so you get a verified total rather than an estimate. See our guide to [types of per diem allowances](/blog/types-of-per-diem-allowances) for how this transportation-industry rate compares to the standard GSA system.",
    ],
    faq: [
      { q: "Is the truck driver per diem rate the same as the GSA rate?", a: "No — it's a separate, flat IRS rate specifically for DOT-regulated transportation workers, not the city-by-city GSA table used for ordinary business travel." },
      { q: "Why is only 80% of the transportation per diem deductible?", a: "The IRS sets an 80% deduction limit specifically for this transportation-industry allowance, rather than the full amount, as fixed in the underlying IRS notice." },
      { q: "What counts as a qualifying day for truck driver per diem?", a: "A day you're away from your tax home overnight and subject to DOT hours-of-service rules while working in the transportation industry." },
    ],
  },
  {
    slug: "per-diem-calculator",
    tool: "perdiem",
    title: "Per Diem Calculator (GSA FY2026 rates)",
    h1: "Per Diem Calculator",
    keyword: "per diem calculator",
    description:
      "Calculate the total per diem for a business trip using the official GSA FY2026 lodging and M&IE rates, with the 75% first-and-last-day rule applied automatically.",
    intro:
      "Pick your destination and travel dates and PerDiemWise totals your lodging and meals & incidentals using the real GSA FY2026 rates — applying the 75% first-and-last-day M&IE rule and the correct nightly lodging cap for each date, broken out day by day.",
    about: [
      "Per diem is a fixed daily allowance — separate lodging and meals-and-incidentals (M&IE) figures — paid instead of reimbursing every individual receipt from a business trip. This calculator uses the official GSA FY2026 rate table, covering around 300 higher-cost cities plus the standard CONUS rate ($110 lodging / $68 M&IE) that applies everywhere else.",
      "Two rules trip up almost every manual calculation: M&IE is paid at only 75% on your first and last travel day, and seasonal destinations have a different lodging cap for each month. This tool applies both automatically, so a multi-night trip that straddles a season change is totalled correctly without you having to look up two different monthly rates by hand.",
      "For the full mechanics behind the numbers, see [what is per diem?](/blog/what-is-per-diem) and [how to calculate per diem for a business trip](/blog/how-to-calculate-per-diem-for-a-business-trip).",
    ],
    faq: [
      { q: "Does this calculator use the real GSA rates?", a: "Yes — it uses the official GSA FY2026 lodging and M&IE tables for every listed city, plus the standard CONUS rate for everywhere else." },
      { q: "Does it apply the 75% first-and-last-day rule automatically?", a: "Yes — M&IE is calculated at 75% on your first and last travel day and 100% on full days in between, without you needing to adjust it manually." },
      { q: "What if my destination isn't a listed GSA city?", a: "The calculator automatically falls back to the standard CONUS rate ($110 lodging / $68 M&IE for FY2026) for any US destination GSA hasn't separately listed." },
    ],
  },
  {
    slug: "mileage-reimbursement-calculator",
    tool: "mileage",
    title: "Mileage Reimbursement Calculator (2026 IRS rate)",
    h1: "Mileage Reimbursement Calculator",
    keyword: "mileage reimbursement calculator",
    description:
      "Work out a mileage reimbursement using the 2026 IRS standard mileage rates — 72.5¢ business, 20.5¢ medical/moving and 14¢ charitable per mile.",
    intro:
      "Enter your trip miles and PerDiemWise multiplies them by the current 2026 IRS standard mileage rate — 72.5¢ for business, 20.5¢ for medical or moving, and 14¢ for charitable driving. Add multiple legs to total a whole trip.",
    about: [
      "The IRS sets an optional standard mileage rate each year to value the deductible or reimbursable cost of running a personal vehicle for business, medical, moving or charitable driving. For 2026, the business rate opened at 72.5¢ per mile and rose to 76¢ per mile from July 1 after a rare mid-year adjustment driven by fuel costs — see our [full breakdown of the 2026 rate change](/blog/2026-irs-standard-mileage-rate).",
      "This calculator applies the correct half-year rate automatically based on your trip date, and totals multiple legs — office to client, client to client, client back to office — leg by leg rather than as a single straight-line distance, which is how the IRS expects mileage to be logged and reimbursed.",
      "Reimbursing at or below the IRS rate under an accountable plan keeps the payment tax-free to the employee; our guide to [IRS mileage reimbursement rules for employers](/blog/irs-mileage-reimbursement-rules) covers the compliance side in full.",
    ],
    faq: [
      { q: "Which 2026 mileage rate does this calculator use?", a: "It applies 72.5¢ per mile for business trips before July 1, 2026, and 76¢ per mile from July 1 onward, matching the trip date you enter." },
      { q: "Can I calculate a multi-stop trip?", a: "Yes — add each leg separately and the calculator totals them, which is the correct way to log a trip with multiple stops rather than a single straight-line distance." },
      { q: "Does this calculator cover medical and charitable mileage too?", a: "Yes — select the relevant purpose and it applies the correct 2026 rate for business, medical/moving, or charitable driving." },
    ],
  },
  {
    slug: "meals-and-incidentals-calculator",
    tool: "mie",
    title: "M&IE Per Diem Calculator (meals & incidentals)",
    h1: "Meals & Incidentals (M&IE) Calculator",
    keyword: "m&ie calculator",
    description:
      "See the GSA meals & incidental expense (M&IE) per diem for any tier, including the breakfast/lunch/dinner split and the 75% first-and-last travel-day amount.",
    intro:
      "Every GSA destination falls into one of five M&IE tiers. Choose a destination to see its meals & incidentals allowance, the breakfast / lunch / dinner / incidentals split, and the reduced 75% rate paid on your first and last day of travel.",
    about: [
      "M&IE isn't a single number — GSA publishes a full breakdown by meal (breakfast, lunch, dinner) plus a flat $5/day incidentals allowance, so travellers can deduct any meal that was provided free of charge, such as a conference lunch or a hotel breakfast. See our [full M&IE breakdown](/blog/meals-and-incidentals-mie-breakdown-explained) for the exact FY2026 figures at every tier.",
      "This calculator lets you mark which meals were provided on a given day and instantly see the adjusted M&IE total, alongside the reduced 75% rate that applies on your first and last day of travel under the [75% first-and-last-day rule](/blog/gsa-per-diem-first-and-last-day-75-percent-rule).",
    ],
    faq: [
      { q: "What are the five GSA M&IE tiers?", a: "The FY2026 tiers are $68 (standard rate), $74, $80, $86 and $92 per day, each with its own breakfast/lunch/dinner/incidentals split." },
      { q: "Does this tool deduct provided meals automatically?", a: "Yes — mark which meals were provided free of charge and it deducts the correct published amount for each one, leaving the $5 incidentals portion untouched." },
      { q: "Is the incidentals amount ever removed from the total?", a: "No — the $5 incidentals allowance is retained even when all three meals are provided, since it covers tips and small fees unrelated to food." },
    ],
  },
];

export function getCalc(slug: string): Calc | null {
  return CALCS.find((c) => c.slug === slug) ?? null;
}
