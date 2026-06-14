"use client";

import { useState } from "react";
import { MILEAGE_PURPOSES, calculateMileage, type MileagePurpose } from "@/lib/mileage";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function MileageCalculator() {
  const [purpose, setPurpose] = useState<MileagePurpose>("business");
  const [legs, setLegs] = useState<string[]>([""]);

  const numericLegs = legs.map((l) => parseFloat(l)).filter((n) => Number.isFinite(n) && n > 0);
  const result = calculateMileage(numericLegs, purpose);
  const active = MILEAGE_PURPOSES.find((p) => p.id === purpose)!;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <label className="mb-1 block text-sm font-medium text-stone-700">Purpose</label>
      <div className="flex flex-wrap gap-2">
        {MILEAGE_PURPOSES.map((p) => (
          <button key={p.id} type="button" onClick={() => setPurpose(p.id)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${purpose === p.id ? "border-sky-500 bg-sky-50 text-sky-700" : "border-stone-300 text-stone-600 hover:bg-stone-50"}`}>
            {p.label} · {(p.rate * 100).toFixed(1)}¢
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-500">{active.note}</p>

      <label className="mt-4 mb-1 block text-sm font-medium text-stone-700">Trip miles</label>
      <div className="space-y-2">
        {legs.map((leg, i) => (
          <div key={i} className="flex gap-2">
            <input type="number" inputMode="decimal" min="0" value={leg} placeholder={`Leg ${i + 1} miles`}
              onChange={(e) => setLegs(legs.map((l, j) => (j === i ? e.target.value : l)))}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-sky-500" />
            {legs.length > 1 && (
              <button type="button" onClick={() => setLegs(legs.filter((_, j) => j !== i))}
                className="rounded-lg border border-stone-300 px-3 text-stone-500 hover:bg-stone-50" aria-label="Remove leg">×</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setLegs([...legs, ""])}
        className="mt-2 text-sm font-medium text-sky-700 hover:underline">+ Add another leg</button>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Stat label="Total miles" value={result.miles.toLocaleString("en-US")} />
        <Stat label="IRS rate (2026)" value={`${(result.rate * 100).toFixed(1)}¢`} />
        <Stat label="Reimbursement" value={usd(result.amount)} highlight />
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-sky-200 bg-sky-50" : "border-stone-200 bg-stone-50"}`}>
      <div className="text-xs text-stone-500">{label}</div>
      <div className={`text-xl font-bold ${highlight ? "text-sky-700" : "text-stone-900"}`}>{value}</div>
    </div>
  );
}
