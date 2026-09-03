"use client";

import { useState } from "react";
import SaveToAccountButton from "@/components/SaveToAccountButton";
import { calculateTruckerPerDiem, TRANSPORTATION_PER_DIEM, type TransportationRegion } from "@/lib/truckers";
import type { NewCloudTrip } from "@/lib/trips-remote";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function TruckDriverCalculator() {
  const [region, setRegion] = useState<TransportationRegion>("conus");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  let error: string | null = null;

  let result: ReturnType<typeof calculateTruckerPerDiem> | null = null;
  if (startDate && endDate) {
    try {
      result = calculateTruckerPerDiem({ startDate, endDate, region });
    } catch (e) {
      result = null;
      error = e instanceof Error ? e.message : "Could not calculate this period.";
    }
  }

  const buildCloudTrip = (): NewCloudTrip | null => result ? {
    kind: "trucker",
    name: `Driver per diem · ${startDate} to ${endDate}`,
    total: result.deductibleAmount,
    data: { start: startDate, end: endDate, region, days: result.days, gross: result.grossPerDiem, deductible: result.deductibleAmount },
  } : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-30px_rgba(24,23,18,0.25)]">
      <div className="flex items-center justify-between border-b border-line bg-paper-2/40 px-5 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Driver tax log</span>
        <span className="font-mono text-xs text-muted">IRS verified · 2025–26</span>
      </div>
      <div className="p-5">
        <p className="text-sm leading-relaxed text-muted">For qualifying transportation workers subject to DOT hours-of-service rules. This is the IRS special rate, not the ordinary GSA employer reimbursement rate.</p>
        <fieldset className="mt-4">
          <legend className="mb-1.5 block text-sm font-medium text-ink-soft">Travel region</legend>
          <div className="flex gap-2">
            {(["conus", "oconus"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setRegion(item)} className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition ${region === item ? "border-accent bg-accent-tint text-accent-dark" : "border-line-strong text-ink-soft hover:border-ink/30"}`}>
                {item.toUpperCase()} · {usd(item === "conus" ? TRANSPORTATION_PER_DIEM.conus : TRANSPORTATION_PER_DIEM.oconus)}/day
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div><label htmlFor="truck-start" className="mb-1.5 block text-sm font-medium text-ink-soft">Away from home</label><input id="truck-start" type="date" min={TRANSPORTATION_PER_DIEM.effectiveFrom} max={TRANSPORTATION_PER_DIEM.effectiveThrough} value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-ink outline-none transition focus:border-accent" /></div>
          <div><label htmlFor="truck-end" className="mb-1.5 block text-sm font-medium text-ink-soft">Back home</label><input id="truck-end" type="date" min={startDate || TRANSPORTATION_PER_DIEM.effectiveFrom} max={TRANSPORTATION_PER_DIEM.effectiveThrough} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-ink outline-none transition focus:border-accent" /></div>
        </div>
        {error && <p className="mt-4 rounded-xl bg-clay/10 px-3 py-2 text-sm text-clay" role="alert">{error}</p>}
        {!startDate || !endDate ? <p className="mt-4 text-sm text-muted">Add a verified-period date range to build the tax log.</p> : result ? (
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
              <Stat label="Qualifying days" value={String(result.days)} />
              <Stat label="Gross per diem" value={usd(result.grossPerDiem)} />
              <Stat label="80% deductible" value={usd(result.deductibleAmount)} highlight />
              <Stat label="Not deductible" value={usd(result.nonDeductibleAmount)} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4"><span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Pro tax-year log</span><SaveToAccountButton buildTrip={buildCloudTrip} /></div>
          </div>
        ) : null}
        <p className="mt-4 text-xs leading-relaxed text-muted">Verified source: <a href={TRANSPORTATION_PER_DIEM.source} target="_blank" rel="noreferrer" className="text-accent underline">IRS Notice 2025-54</a>. The special rate is $80 CONUS / $86 OCONUS, effective October 1, 2025 through September 30, 2026. Keep your own qualifying-day records and consult a tax professional.</p>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`p-3.5 ${highlight ? "bg-accent-tint" : "bg-surface"}`}><div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div><div className={`tnum mt-0.5 text-xl font-semibold ${highlight ? "text-accent-dark" : "text-ink"}`}>{value}</div></div>;
}
