"use client";

import { useMemo, useState } from "react";
import { LOCATIONS, MIE_BREAKDOWN, STANDARD_MIE, firstLastForMie } from "@/lib/gsa";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function MieCalculator({ initialSlug }: { initialSlug?: string }) {
  const initial = initialSlug ? LOCATIONS.find((l) => l.slug === initialSlug) : undefined;
  const [query, setQuery] = useState(initial ? `${initial.city}, ${initial.state}` : "");
  const [mie, setMie] = useState<number>(initial?.mie ?? STANDARD_MIE);
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LOCATIONS.slice(0, 8);
    return LOCATIONS.filter((l) => `${l.city} ${l.state}`.toLowerCase().includes(q)).slice(0, 30);
  }, [query]);

  const tier = MIE_BREAKDOWN.find((t) => t.total === mie);
  const firstLast = firstLastForMie(mie);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <label className="mb-1 block text-sm font-medium text-stone-700">Destination</label>
      <div className="relative">
        <input value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search a city — or leave blank for the standard $68 rate"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-sky-500" />
        {open && (
          <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-stone-200 bg-white shadow-lg">
            <li><button type="button" onMouseDown={() => { setMie(STANDARD_MIE); setQuery("Standard CONUS rate"); setOpen(false); }}
              className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-stone-50"><span className="font-medium">Standard CONUS rate</span><span className="text-stone-500">$68</span></button></li>
            {matches.map((l) => (
              <li key={l.slug}><button type="button" onMouseDown={() => { setMie(l.mie); setQuery(`${l.city}, ${l.state}`); setOpen(false); }}
                className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-stone-50"><span>{l.city}, {l.state}</span><span className="text-stone-500">${l.mie}</span></button></li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-center">
        <Stat label="Full-day M&IE" value={usd(mie)} highlight />
        <Stat label="First & last day (75%)" value={usd(firstLast)} />
      </div>

      {tier && (
        <table className="mt-4 w-full text-sm">
          <tbody>
            <Row label="Breakfast" value={usd(tier.breakfast)} />
            <Row label="Lunch" value={usd(tier.lunch)} />
            <Row label="Dinner" value={usd(tier.dinner)} />
            <Row label="Incidentals" value={usd(tier.incidental)} />
            <tr className="border-t border-stone-300 font-semibold"><td className="py-2">Total</td><td className="text-right">{usd(tier.total)}</td></tr>
          </tbody>
        </table>
      )}
      <p className="mt-3 text-xs text-stone-500">Deduct any provided meal from the day&apos;s M&amp;IE; the $5 incidental portion always remains.</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <tr className="border-b border-stone-100"><td className="py-2 text-stone-600">{label}</td><td className="text-right">{value}</td></tr>;
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-sky-200 bg-sky-50" : "border-stone-200 bg-stone-50"}`}>
      <div className="text-xs text-stone-500">{label}</div>
      <div className={`text-xl font-bold ${highlight ? "text-sky-700" : "text-stone-900"}`}>{value}</div>
    </div>
  );
}
