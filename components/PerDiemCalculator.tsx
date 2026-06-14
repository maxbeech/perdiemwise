"use client";

import { useMemo, useState } from "react";
import { LOCATIONS, FISCAL_YEAR_LABEL } from "@/lib/gsa";
import { calculateTrip, type TripResult } from "@/lib/perdiem";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const DAY_LABEL: Record<string, string> = { first: "Travel day (75% M&IE)", full: "Full day", last: "Return day (75% M&IE)", single: "Same-day trip (75% M&IE)" };

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export default function PerDiemCalculator({ initialSlug }: { initialSlug?: string }) {
  const initial = initialSlug ? LOCATIONS.find((l) => l.slug === initialSlug) : undefined;
  const [query, setQuery] = useState(initial ? `${initial.city}, ${initial.state}` : "");
  const [slug, setSlug] = useState<string | null>(initial?.slug ?? null);
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LOCATIONS.slice(0, 8);
    return LOCATIONS.filter((l) => `${l.city} ${l.state} ${l.county ?? ""}`.toLowerCase().includes(q)).slice(0, 30);
  }, [query]);

  let result: TripResult | null = null;
  let error: string | null = null;
  if (start && end) {
    try {
      result = calculateTrip({ locationSlug: slug, startDate: start, endDate: end });
    } catch (e) {
      error = e instanceof Error ? e.message : "Could not calculate this trip.";
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative sm:col-span-3">
          <label className="mb-1 block text-sm font-medium text-stone-700">Destination</label>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSlug(null); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search a city (e.g. San Francisco) — or leave blank for the standard rate"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-sky-500"
          />
          {open && (
            <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-stone-200 bg-white shadow-lg">
              <li>
                <button type="button" onMouseDown={() => { setSlug(null); setQuery("Standard CONUS rate"); setOpen(false); }}
                  className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-stone-50">
                  <span className="font-medium">Standard CONUS rate</span>
                  <span className="text-stone-500">$110 + $68</span>
                </button>
              </li>
              {matches.map((l) => (
                <li key={l.slug}>
                  <button type="button" onMouseDown={() => { setSlug(l.slug); setQuery(`${l.city}, ${l.state}`); setOpen(false); }}
                    className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-stone-50">
                    <span>{l.city}, {l.state}{l.county ? <span className="text-stone-400"> · {l.county}</span> : null}</span>
                    <span className="text-stone-500">M&IE ${l.mie}</span>
                  </button>
                </li>
              ))}
              {matches.length === 0 && <li className="px-3 py-2 text-sm text-stone-500">No GSA city matches — leave blank to use the standard rate.</li>}
            </ul>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Depart</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-sky-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Return</label>
          <input type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-sky-500" />
        </div>
        <div className="flex items-end text-xs text-stone-500">Rates: {FISCAL_YEAR_LABEL}</div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {!start || !end ? (
        <p className="mt-4 text-sm text-stone-500">Choose your travel dates to see the itemised per diem.</p>
      ) : result ? (
        <div className="mt-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Lodging" value={usd(result.lodgingTotal)} sub={`${result.nights} night${result.nights === 1 ? "" : "s"}`} />
            <Stat label="Meals & incidentals" value={usd(result.mieTotal)} sub={`${result.days} day${result.days === 1 ? "" : "s"}`} />
            <Stat label="Total per diem" value={usd(result.total)} sub={result.location.isStandard ? "standard rate" : `${result.location.city}, ${result.location.state}`} highlight />
          </div>
          {result.location.isStandard && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              This destination isn&apos;t separately listed by GSA, so the <strong>standard CONUS rate</strong> ($110 lodging / $68 M&amp;IE) is applied.
            </p>
          )}
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="py-2 font-medium">Date</th><th className="font-medium">Day</th>
                <th className="font-medium">Lodging</th><th className="font-medium">M&amp;IE</th>
              </tr>
            </thead>
            <tbody>
              {result.lines.map((l) => (
                <tr key={l.date} className="border-b border-stone-100">
                  <td className="py-2">{fmtDate(l.date)}</td>
                  <td className="text-stone-500">{DAY_LABEL[l.type]}</td>
                  <td>{l.lodging ? usd(l.lodging) : <span className="text-stone-400">—</span>}</td>
                  <td>{usd(l.mie)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-sky-200 bg-sky-50" : "border-stone-200 bg-stone-50"}`}>
      <div className="text-xs text-stone-500">{label}</div>
      <div className={`text-xl font-bold ${highlight ? "text-sky-700" : "text-stone-900"}`}>{value}</div>
      <div className="text-[11px] text-stone-500">{sub}</div>
    </div>
  );
}
