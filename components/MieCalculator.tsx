"use client";

import { useState } from "react";
import CityCombobox from "@/components/CityCombobox";
import { STANDARD_MIE, firstLastForMie, mieAfterMeals, tierForMie, type GsaLocation } from "@/lib/gsa";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function MieCalculator() {
  const [loc, setLoc] = useState<GsaLocation | null>(null);
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });

  const mie = loc?.mie ?? STANDARD_MIE;
  const tier = tierForMie(mie);
  const fullAfter = mieAfterMeals(mie, tier, meals);
  const firstLastAfter = mieAfterMeals(firstLastForMie(mie), tier, meals);

  const rows: { key: "breakfast" | "lunch" | "dinner" | "incidental"; label: string; value: number; deductible: boolean }[] = [
    { key: "breakfast", label: "Breakfast", value: tier.breakfast, deductible: true },
    { key: "lunch", label: "Lunch", value: tier.lunch, deductible: true },
    { key: "dinner", label: "Dinner", value: tier.dinner, deductible: true },
    { key: "incidental", label: "Incidentals", value: tier.incidental, deductible: false },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-30px_rgba(24,23,18,0.25)]">
      <div className="flex items-center justify-between border-b border-line bg-paper-2/40 px-5 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Meals &amp; incidentals</span>
        <span className="font-mono text-xs text-muted">GSA FY2026</span>
      </div>
      <div className="p-5">
        <label className="mb-1.5 block text-sm font-medium text-ink-soft">Destination</label>
        <CityCombobox onChange={setLoc} idPrefix="mie" placeholder="Search a city — or leave blank for the standard $68 rate" />

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-ink-soft">Meals provided? <span className="font-normal text-muted">— deducted</span></legend>
          <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            {(["breakfast", "lunch", "dinner"] as const).map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2 capitalize">
                <input type="checkbox" checked={meals[m]} onChange={(e) => setMeals({ ...meals, [m]: e.target.checked })} className="h-4 w-4 rounded border-line-strong accent-accent" />
                {m}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
          <Stat label="Full-day M&IE" value={usd(fullAfter)} highlight />
          <Stat label="First & last day (75%)" value={usd(firstLastAfter)} />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r) => {
                const struck = r.deductible && meals[r.key as "breakfast" | "lunch" | "dinner"];
                return (
                  <tr key={r.key} className="border-b border-line last:border-0">
                    <td className={`px-3 py-2 ${struck ? "text-muted line-through" : "text-ink-soft"}`}>{r.label}{struck ? " · provided" : ""}</td>
                    <td className={`tnum px-3 text-right ${struck ? "text-muted line-through" : "text-ink"}`}>{usd(r.value)}</td>
                  </tr>
                );
              })}
              <tr className="bg-paper-2/50 font-semibold"><td className="px-3 py-2 text-ink">Total full-day M&amp;IE</td><td className="tnum px-3 text-right text-ink">{usd(fullAfter)}</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">Deduct any meal provided to you; the $5 incidental portion always remains.</p>
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
