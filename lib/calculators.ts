// Calculator definitions drive the /calculators hub and each /calculators/[slug]
// page. The `tool` key selects which interactive component the page renders, and
// each page foregrounds its own topic (title/intro/keyword) so it is a distinct,
// relevant landing page rather than one generic calculator repeated.

export type ToolKey = "perdiem" | "mileage" | "mie";

export interface Calc {
  slug: string;
  tool: ToolKey;
  title: string;
  h1: string;
  keyword: string;
  description: string;
  intro: string;
}

export const CALCS: Calc[] = [
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
  },
];

export function getCalc(slug: string): Calc | null {
  return CALCS.find((c) => c.slug === slug) ?? null;
}
