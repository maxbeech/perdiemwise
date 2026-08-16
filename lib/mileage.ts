import { mileageRateForDate } from "./site";

// IRS standard-mileage reimbursement engine. Rates are the real 2026 optional
// standard mileage rates (lib/site.ts → mileageRateForDate). Nothing is
// fabricated. 2026 had a rare mid-year rate change, so the applicable rate
// depends on the trip date (defaults to today when no date is given).

export type MileagePurpose = "business" | "medical" | "charity";

export const MILEAGE_PURPOSE_META: {
  id: MileagePurpose;
  label: string;
  note: string;
}[] = [
  { id: "business", label: "Business", note: "Driving for work — the most common reimbursement rate." },
  { id: "medical", label: "Medical / moving", note: "Medical travel, and moving for active-duty Armed Forces members." },
  { id: "charity", label: "Charitable", note: "Driving in service of a charity — set by statute, not the IRS." },
];

export function rateFor(purpose: MileagePurpose, date?: string | Date): number {
  return mileageRateForDate(date).rates[purpose];
}

/** Purpose metadata plus the rate applicable on the given date (defaults to today). */
export function mileagePurposes(date?: string | Date): (typeof MILEAGE_PURPOSE_META[number] & { rate: number })[] {
  return MILEAGE_PURPOSE_META.map((p) => ({ ...p, rate: rateFor(p.id, date) }));
}

/** Reimbursement for a set of trip legs (miles) at the chosen IRS rate. */
export function calculateMileage(
  legs: number[],
  purpose: MileagePurpose,
  date?: string | Date,
): { miles: number; rate: number; amount: number } {
  const miles = legs.reduce((s, m) => s + (Number.isFinite(m) && m > 0 ? m : 0), 0);
  const rate = rateFor(purpose, date);
  // Reimbursements are paid to the cent.
  const amount = Math.round(miles * rate * 100) / 100;
  return { miles: Math.round(miles * 100) / 100, rate, amount };
}
