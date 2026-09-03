// Verified transportation-industry per diem data. This is deliberately kept
// separate from GSA employer reimbursement rates: DOT-regulated workers use
// the IRS special transportation rate for tax substantiation.

export const TRANSPORTATION_PER_DIEM = {
  effectiveFrom: "2025-10-01",
  effectiveThrough: "2026-09-30",
  conus: 80,
  oconus: 86,
  deductionRate: 0.8,
  incidentalOnly: 5,
  source: "https://www.irs.gov/pub/irs-drop/n-25-54.pdf",
} as const;

export type TransportationRegion = "conus" | "oconus";

export interface TruckerPerDiemResult {
  days: number;
  dailyRate: number;
  grossPerDiem: number;
  deductibleAmount: number;
  nonDeductibleAmount: number;
  region: TransportationRegion;
  effectivePeriod: string;
}

function isoDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Enter dates as YYYY-MM-DD.");
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error("Enter a valid travel date.");
  }
  return value;
}

function inclusiveDays(start: string, end: string): number {
  const from = new Date(`${start}T12:00:00Z`).getTime();
  const to = new Date(`${end}T12:00:00Z`).getTime();
  if (to < from) throw new Error("Return date cannot be before departure date.");
  return Math.floor((to - from) / 86_400_000) + 1;
}

function assertCoveredByVerifiedPeriod(start: string, end: string): void {
  if (start < TRANSPORTATION_PER_DIEM.effectiveFrom || end > TRANSPORTATION_PER_DIEM.effectiveThrough) {
    throw new Error(`No verified transportation-industry rate is available for the full period. This calculator covers ${TRANSPORTATION_PER_DIEM.effectiveFrom} through ${TRANSPORTATION_PER_DIEM.effectiveThrough}.`);
  }
}

export function calculateTruckerPerDiem(input: {
  startDate: string;
  endDate: string;
  region: TransportationRegion;
}): TruckerPerDiemResult {
  const start = isoDate(input.startDate);
  const end = isoDate(input.endDate);
  assertCoveredByVerifiedPeriod(start, end);
  const days = inclusiveDays(start, end);
  const dailyRate = input.region === "oconus" ? TRANSPORTATION_PER_DIEM.oconus : TRANSPORTATION_PER_DIEM.conus;
  const grossPerDiem = Math.round(days * dailyRate * 100) / 100;
  const deductibleAmount = Math.round(grossPerDiem * TRANSPORTATION_PER_DIEM.deductionRate * 100) / 100;
  return {
    days,
    dailyRate,
    grossPerDiem,
    deductibleAmount,
    nonDeductibleAmount: Math.round((grossPerDiem - deductibleAmount) * 100) / 100,
    region: input.region,
    effectivePeriod: `${TRANSPORTATION_PER_DIEM.effectiveFrom} to ${TRANSPORTATION_PER_DIEM.effectiveThrough}`,
  };
}
