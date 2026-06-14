import { IRS_MILEAGE_2026 } from "./site";

// IRS standard-mileage reimbursement engine. Rates are the real 2026 optional
// standard mileage rates (lib/site.ts → IRS_MILEAGE_2026). Nothing is fabricated.

export type MileagePurpose = "business" | "medical" | "charity";

export const MILEAGE_PURPOSES: {
  id: MileagePurpose;
  label: string;
  rate: number;
  note: string;
}[] = [
  {
    id: "business",
    label: "Business",
    rate: IRS_MILEAGE_2026.rates.business,
    note: "Driving for work — the most common reimbursement rate.",
  },
  {
    id: "medical",
    label: "Medical / moving",
    rate: IRS_MILEAGE_2026.rates.medical,
    note: "Medical travel, and moving for active-duty Armed Forces members.",
  },
  {
    id: "charity",
    label: "Charitable",
    rate: IRS_MILEAGE_2026.rates.charity,
    note: "Driving in service of a charity — set by statute, not the IRS.",
  },
];

export function rateFor(purpose: MileagePurpose): number {
  return IRS_MILEAGE_2026.rates[purpose];
}

/** Reimbursement for a set of trip legs (miles) at the chosen IRS rate. */
export function calculateMileage(
  legs: number[],
  purpose: MileagePurpose,
): { miles: number; rate: number; amount: number } {
  const miles = legs.reduce((s, m) => s + (Number.isFinite(m) && m > 0 ? m : 0), 0);
  const rate = rateFor(purpose);
  // Reimbursements are paid to the cent.
  const amount = Math.round(miles * rate * 100) / 100;
  return { miles: Math.round(miles * 100) / 100, rate, amount };
}
