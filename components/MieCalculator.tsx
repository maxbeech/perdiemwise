"use client";

import { useState } from "react";
import CityCombobox from "@/components/CityCombobox";
import { STANDARD_MIE, firstLastForMie, mieAfterMeals, tierForMie, type GsaLocation } from "@/lib/gsa";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function MieCalculator({ initialSlug }: { initialSlug?: string }) {
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
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <label className="mb-1 block text-sm font-medium text-stone-700">Destination</label>
      <CityCombobox initialSlug={initialSlug} onChange={setLoc} idPrefix="mie" placeholder="Search a city — or leave blank for the standard $68 rate" />

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-stone-700">Meals provided? <span className="font-normal text-stone-500">(deducted)</span></legend>
        <div className="mt-1 flex flex-wrap gap-4 text-sm text-stone-600">
          {(["breakfast", "lunch", "dinner"] as const).map((m) => (
            <label key={m} className="flex items-center gap-2 capitalize">
              <input type="checkbox" checked={meals[m]} onChange={(e) => setMeals({ ...meals, [m]: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-sky-600" />
              {m}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid grid-cols-2 gap-3 text-center">
        <Stat label="Full-day M&IE" value={usd(fullAfter)} highlight />
        <Stat label="First & last day (75%)" value={usd(firstLastAfter)} />
      </div>

      <table className="mt-4 w-full text-sm">
        <tbody>
          {rows.map((r) => {
            const struck = r.deductible && meals[r.key as "breakfast" | "lunch" | "dinner"];
            return (
              <tr key={r.key} className="border-b border-stone-100">
                <td className={`py-2 ${struck ? "text-stone-400 line-through" : "text-stone-600"}`}>{r.label}{struck ? " (provided)" : ""}</td>
                <td className={`text-right ${struck ? "text-stone-400 line-through" : ""}`}>{usd(r.value)}</td>
              </tr>
            );
          })}
          <tr className="border-t border-stone-300 font-semibold"><td className="py-2">Total full-day M&amp;IE</td><td className="text-right">{usd(fullAfter)}</td></tr>
        </tbody>
      </table>
      <p className="mt-3 text-xs text-stone-500">Deduct any meal provided to you; the $5 incidental portion always remains.</p>
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
