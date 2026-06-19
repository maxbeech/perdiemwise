"use client";

import { useState } from "react";
import CityCombobox from "@/components/CityCombobox";
import { FISCAL_YEAR_LABEL, type GsaLocation } from "@/lib/gsa";
import { calculateTrip, type TripResult } from "@/lib/perdiem";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const DAY_LABEL: Record<string, string> = { first: "Travel day (75% M&IE)", full: "Full day", last: "Return day (75% M&IE)", single: "Same-day trip (75% M&IE)" };
const DISPLAY_CAP = 62;

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export default function PerDiemCalculator({ initialSlug }: { initialSlug?: string }) {
  const [loc, setLoc] = useState<GsaLocation | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });
  const [copied, setCopied] = useState(false);
  const [copyText, setCopyText] = useState<string | null>(null);

  let result: TripResult | null = null;
  let error: string | null = null;
  if (start && end) {
    try {
      result = calculateTrip({ locationSlug: loc?.slug ?? null, startDate: start, endDate: end, providedMeals: meals });
    } catch (e) {
      error = e instanceof Error ? e.message : "Could not calculate this trip.";
    }
  }

  async function copySummary() {
    if (!result) return;
    const where = result.location.isStandard ? "Standard CONUS rate" : `${result.location.city}, ${result.location.state}`;
    const text = [
      `Per diem — ${where} (GSA ${FISCAL_YEAR_LABEL.split(" (")[0]})`,
      `${start} to ${end} · ${result.days} day(s), ${result.nights} night(s)`,
      ...result.lines.map((l) => `  ${l.date}  ${DAY_LABEL[l.type]}  lodging ${l.lodging ? usd(l.lodging) : "—"}  M&IE ${usd(l.mie)}`),
      `Lodging total: ${usd(result.lodgingTotal)}`,
      `M&IE total: ${usd(result.mieTotal)}${result.mealsDeducted > 0 ? ` (after ${usd(result.mealsDeducted)} provided-meal deductions)` : ""}`,
      `TOTAL PER DIEM: ${usd(result.total)}`,
    ].join("\n");
    // Primary: async clipboard. Fallback (blocked/unsupported): show a selectable
    // box so the summary is never a dead button.
    try {
      await navigator.clipboard.writeText(text);
      setCopyText(null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyText(text);
    }
  }

  const tooLong = result && result.days > DISPLAY_CAP;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="mb-1 block text-sm font-medium text-stone-700">Destination</label>
          <CityCombobox initialSlug={initialSlug} onChange={setLoc} idPrefix="trip" />
        </div>
        <div>
          <label htmlFor="trip-depart" className="mb-1 block text-sm font-medium text-stone-700">Depart</label>
          <input id="trip-depart" type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-sky-500" />
        </div>
        <div>
          <label htmlFor="trip-return" className="mb-1 block text-sm font-medium text-stone-700">Return</label>
          <input id="trip-return" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-sky-500" />
        </div>
        <div className="flex items-end text-xs text-stone-500">Rates: {FISCAL_YEAR_LABEL}</div>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-stone-700">Meals provided? <span className="font-normal text-stone-500">(deducted from M&amp;IE)</span></legend>
        <div className="mt-1 flex flex-wrap gap-4 text-sm text-stone-600">
          {(["breakfast", "lunch", "dinner"] as const).map((m) => (
            <label key={m} className="flex items-center gap-2 capitalize">
              <input type="checkbox" checked={meals[m]} onChange={(e) => setMeals({ ...meals, [m]: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-sky-600" />
              {m}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}

      {!start || !end ? (
        <p className="mt-4 text-sm text-stone-500">Choose your travel dates to see the itemised per diem.</p>
      ) : result ? (
        <div className="mt-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Lodging" value={usd(result.lodgingTotal)} sub={`${result.nights} night${result.nights === 1 ? "" : "s"}`} />
            <Stat label="Meals & incidentals" value={usd(result.mieTotal)} sub={`${result.days} day${result.days === 1 ? "" : "s"}`} />
            <Stat label="Total per diem" value={usd(result.total)} sub={result.location.isStandard ? "standard rate" : `${result.location.city}, ${result.location.state}`} highlight />
          </div>
          {result.mealsDeducted > 0 && (
            <p className="mt-3 text-xs text-stone-500">Provided meals reduced M&amp;IE by {usd(result.mealsDeducted)} (incidentals are always retained).</p>
          )}
          {result.location.isStandard && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              This destination isn&apos;t separately listed by GSA, so the <strong>standard CONUS rate</strong> ($110 lodging / $68 M&amp;IE) is applied.
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-700">Day-by-day breakdown</h3>
            <button type="button" onClick={copySummary} className="rounded-lg border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50">
              {copied ? "Copied ✓" : "Copy summary"}
            </button>
          </div>
          {copyText && (
            <div className="mt-2">
              <p className="text-xs text-stone-500">Select all and copy:</p>
              <textarea readOnly value={copyText} rows={Math.min(10, result.lines.length + 4)} onFocus={(e) => e.currentTarget.select()}
                className="mt-1 w-full rounded-lg border border-stone-300 p-2 font-mono text-xs text-stone-700" />
            </div>
          )}
          {tooLong ? (
            <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">This trip spans {result.days} days — the totals above are correct; the day-by-day list is hidden for trips over {DISPLAY_CAP} days.</p>
          ) : (
            <table className="mt-2 w-full text-sm">
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
          )}
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
