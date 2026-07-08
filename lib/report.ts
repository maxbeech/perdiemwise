import { calculateTrip, type TripResult } from "@/lib/perdiem";
import { IRS_MILEAGE_2026 } from "@/lib/site";
import type { CloudTrip } from "@/lib/trips-remote";

// Turns stored trip rows into fully-computed report items. Per-diem trips are
// recomputed from their inputs against the live GSA data (never a stale stored
// total), so the exported expense report is always internally consistent and
// audit-defensible. Invalid rows are skipped rather than faked.

export interface PerDiemReportItem {
  id: string;
  name: string;
  locationLabel: string;
  start: string;
  end: string;
  result: TripResult;
}

export interface MileageReportItem {
  id: string;
  name: string;
  miles: number;
  category: "business" | "medical" | "charity";
  rate: number;
  amount: number;
}

export interface ReportData {
  perDiem: PerDiemReportItem[];
  mileage: MileageReportItem[];
  perDiemTotal: number;
  mileageTotal: number;
  grandTotal: number;
}

export function buildReport(trips: CloudTrip[]): ReportData {
  const perDiem: PerDiemReportItem[] = [];
  const mileage: MileageReportItem[] = [];

  for (const t of trips) {
    if (t.kind === "mileage") {
      const d = t.data as { miles?: number; category?: MileageReportItem["category"] };
      const category = d.category ?? "business";
      const rate = IRS_MILEAGE_2026.rates[category];
      const miles = Number(d.miles) || 0;
      mileage.push({ id: t.id, name: t.name, miles, category, rate, amount: round2(miles * rate) });
      continue;
    }
    const d = t.data as { locationSlug?: string | null; locationLabel?: string; start?: string; end?: string; meals?: Record<string, boolean> };
    if (!d.start || !d.end) continue;
    try {
      const result = calculateTrip({
        locationSlug: d.locationSlug ?? null,
        startDate: d.start,
        endDate: d.end,
        providedMeals: d.meals,
      });
      perDiem.push({
        id: t.id,
        name: t.name,
        locationLabel: d.locationLabel ?? (result.location.isStandard ? "Standard CONUS rate" : `${result.location.city}, ${result.location.state}`),
        start: d.start,
        end: d.end,
        result,
      });
    } catch {
      /* skip un-recomputable rows rather than emit a fabricated line */
    }
  }

  const perDiemTotal = round2(perDiem.reduce((s, i) => s + i.result.total, 0));
  const mileageTotal = round2(mileage.reduce((s, i) => s + i.amount, 0));
  return { perDiem, mileage, perDiemTotal, mileageTotal, grandTotal: round2(perDiemTotal + mileageTotal) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
