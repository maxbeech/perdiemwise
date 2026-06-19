"use client";

import { useState } from "react";
import { MILEAGE_PURPOSES, calculateMileage, type MileagePurpose } from "@/lib/mileage";
import { IRS_MILEAGE_2026 } from "@/lib/site";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function MileageCalculator() {
  const [purpose, setPurpose] = useState<MileagePurpose>("business");
  const [legs, setLegs] = useState<string[]>([""]);

  const numericLegs = legs.map((l) => parseFloat(l)).filter((n) => Number.isFinite(n) && n > 0);
  const result = calculateMileage(numericLegs, purpose);
  const active = MILEAGE_PURPOSES.find((p) => p.id === purpose)!;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-30px_rgba(24,23,18,0.25)]">
      <div className="flex items-center justify-between border-b border-line bg-paper-2/40 px-5 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Mileage</span>
        <span className="font-mono text-xs text-muted">IRS {IRS_MILEAGE_2026.taxYear} rates</span>
      </div>
      <div className="p-5">
        <label className="mb-1.5 block text-sm font-medium text-ink-soft">Purpose</label>
        <div className="flex flex-wrap gap-2">
          {MILEAGE_PURPOSES.map((p) => (
            <button key={p.id} type="button" onClick={() => setPurpose(p.id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${purpose === p.id ? "border-accent bg-accent-tint text-accent-dark" : "border-line-strong text-ink-soft hover:border-ink/30"}`}>
              {p.label} · <span className="tnum">{(p.rate * 100).toFixed(1)}¢</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{active.note}</p>

        <label className="mb-1.5 mt-4 block text-sm font-medium text-ink-soft">Trip miles</label>
        <div className="space-y-2">
          {legs.map((leg, i) => (
            <div key={i} className="flex gap-2">
              <input type="number" inputMode="decimal" min="0" value={leg} placeholder={`Leg ${i + 1} miles`}
                onChange={(e) => setLegs(legs.map((l, j) => (j === i ? e.target.value : l)))}
                className="w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-ink outline-none transition focus:border-accent" />
              {legs.length > 1 && (
                <button type="button" onClick={() => setLegs(legs.filter((_, j) => j !== i))}
                  className="rounded-xl border border-line-strong px-3 text-muted transition hover:border-clay hover:text-clay" aria-label="Remove leg">✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setLegs([...legs, ""])} className="mt-2 text-sm font-medium text-accent hover:underline">+ Add another leg</button>

        <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
          <Stat label="Total miles" value={result.miles.toLocaleString("en-US")} />
          <Stat label={`IRS rate (${IRS_MILEAGE_2026.taxYear})`} value={`${(result.rate * 100).toFixed(1)}¢`} />
          <Stat label="Reimbursement" value={usd(result.amount)} highlight />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3.5 ${highlight ? "bg-accent-tint" : "bg-surface"}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
      <div data-stat className={`tnum mt-0.5 text-xl font-semibold ${highlight ? "text-accent-dark" : "text-ink"}`}>{value}</div>
    </div>
  );
}
