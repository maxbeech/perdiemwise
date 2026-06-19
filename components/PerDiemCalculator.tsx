"use client";

import { useState } from "react";
import CityCombobox from "@/components/CityCombobox";
import SavedTrips, { type CurrentTrip } from "@/components/SavedTrips";
import { FISCAL_YEAR_LABEL, getLocation, type GsaLocation } from "@/lib/gsa";
import { calculateTrip, type TripResult } from "@/lib/perdiem";
import type { SavedTrip } from "@/lib/saved-trips";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const DAY_LABEL: Record<string, string> = { first: "Travel day · 75% M&IE", full: "Full day", last: "Return day · 75% M&IE", single: "Same-day trip · 75% M&IE" };
const DISPLAY_CAP = 62;
const fmtDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

export default function PerDiemCalculator({ initialSlug }: { initialSlug?: string }) {
  const [loc, setLoc] = useState<GsaLocation | null>(initialSlug ? getLocation(initialSlug) : null);
  const [seedSlug, setSeedSlug] = useState(initialSlug);
  const [comboKey, setComboKey] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });
  const [copied, setCopied] = useState(false);
  const [copyText, setCopyText] = useState<string | null>(null);

  let result: TripResult | null = null;
  let error: string | null = null;
  if (start && end) {
    try { result = calculateTrip({ locationSlug: loc?.slug ?? null, startDate: start, endDate: end, providedMeals: meals }); }
    catch (e) { error = e instanceof Error ? e.message : "Could not calculate this trip."; }
  }

  const current: CurrentTrip | null = result ? {
    locationSlug: loc?.slug ?? null, locationLabel: loc ? `${loc.city}, ${loc.state}` : "Standard rate",
    start, end, meals, total: result.total,
  } : null;

  function restore(t: SavedTrip) {
    setLoc(t.locationSlug ? getLocation(t.locationSlug) : null);
    setSeedSlug(t.locationSlug ?? undefined);
    setStart(t.start); setEnd(t.end); setMeals(t.meals); setComboKey((k) => k + 1); setCopyText(null);
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
    try { await navigator.clipboard.writeText(text); setCopyText(null); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setCopyText(text); }
  }

  const tooLong = result && result.days > DISPLAY_CAP;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-30px_rgba(24,23,18,0.25)]">
      <div className="flex items-center justify-between border-b border-line bg-paper-2/40 px-5 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Per diem trip</span>
        <span className="font-mono text-xs text-muted">{FISCAL_YEAR_LABEL.split(" (")[0]} rates</span>
      </div>
      <div className="p-5">
        <label className="mb-1.5 block text-sm font-medium text-ink-soft">Destination</label>
        <CityCombobox key={comboKey} initialSlug={seedSlug} onChange={setLoc} idPrefix="trip" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="trip-depart" className="mb-1.5 block text-sm font-medium text-ink-soft">Depart</label>
            <input id="trip-depart" type="date" value={start} onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-ink outline-none transition focus:border-accent" />
          </div>
          <div>
            <label htmlFor="trip-return" className="mb-1.5 block text-sm font-medium text-ink-soft">Return</label>
            <input id="trip-return" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-ink outline-none transition focus:border-accent" />
          </div>
        </div>

        <fieldset className="mt-3">
          <legend className="text-sm font-medium text-ink-soft">Meals provided? <span className="font-normal text-muted">— deducted from M&amp;IE</span></legend>
          <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            {(["breakfast", "lunch", "dinner"] as const).map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2 capitalize">
                <input type="checkbox" checked={meals[m]} onChange={(e) => setMeals({ ...meals, [m]: e.target.checked })} className="h-4 w-4 rounded border-line-strong text-accent accent-accent" />
                {m}
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="mt-4 rounded-xl bg-clay/10 px-3 py-2 text-sm text-clay" role="alert">{error}</p>}

        {!start || !end ? (
          <p className="mt-4 text-sm text-muted">Pick your travel dates to see the itemised per diem.</p>
        ) : result ? (
          <div className="mt-5">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
              <Stat label="Lodging" value={usd(result.lodgingTotal)} sub={`${result.nights} night${result.nights === 1 ? "" : "s"}`} />
              <Stat label="Meals & incidentals" value={usd(result.mieTotal)} sub={`${result.days} day${result.days === 1 ? "" : "s"}`} />
              <Stat label="Total per diem" value={usd(result.total)} sub={result.location.isStandard ? "standard rate" : `${result.location.city}, ${result.location.state}`} highlight />
            </div>
            {result.mealsDeducted > 0 && <p className="mt-2.5 text-xs text-muted">Provided meals reduced M&amp;IE by <span className="tnum">{usd(result.mealsDeducted)}</span> (incidentals are always retained).</p>}
            {result.location.isStandard && <p className="mt-2.5 rounded-xl bg-clay/10 px-3 py-2 text-xs text-clay">Not separately listed by GSA — the <strong>standard CONUS rate</strong> ($110 lodging / $68 M&amp;IE) is applied.</p>}

            <div className="mt-4 flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Day-by-day</h3>
              <button type="button" onClick={copySummary} className="rounded-full border border-line-strong px-3 py-1 text-xs font-medium text-ink-soft transition hover:border-accent hover:text-accent">{copied ? "Copied ✓" : "Copy summary"}</button>
            </div>
            {copyText && (
              <div className="mt-2"><p className="text-xs text-muted">Select all and copy:</p>
                <textarea readOnly value={copyText} rows={Math.min(10, result.lines.length + 4)} onFocus={(e) => e.currentTarget.select()} className="tnum mt-1 w-full rounded-xl border border-line-strong p-2 text-xs text-ink-soft" /></div>
            )}
            {tooLong ? (
              <p className="mt-2 rounded-xl bg-paper-2 px-3 py-2 text-sm text-ink-soft">This trip spans {result.days} days — the totals above are correct; the day-by-day list is hidden for trips over {DISPLAY_CAP} days.</p>
            ) : (
              <div className="mt-2 overflow-hidden rounded-xl border border-line">
                <table className="w-full text-sm">
                  <thead><tr className="bg-paper-2/50 text-left font-mono text-[11px] uppercase tracking-wide text-muted"><th className="px-3 py-2 font-medium">Date</th><th className="font-medium">Day</th><th className="px-3 font-medium">Lodging</th><th className="px-3 font-medium">M&amp;IE</th></tr></thead>
                  <tbody>
                    {result.lines.map((l) => (
                      <tr key={l.date} className="border-t border-line">
                        <td className="px-3 py-2 text-ink">{fmtDate(l.date)}</td>
                        <td className="text-muted">{DAY_LABEL[l.type]}</td>
                        <td className="tnum px-3 text-ink">{l.lodging ? usd(l.lodging) : <span className="text-muted">—</span>}</td>
                        <td className="tnum px-3 text-ink">{usd(l.mie)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}

        <SavedTrips current={current} onRestore={restore} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`p-3.5 ${highlight ? "bg-accent-tint" : "bg-surface"}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
      <div data-stat className={`tnum mt-0.5 text-xl font-semibold ${highlight ? "text-accent-dark" : "text-ink"}`}>{value}</div>
      <div className="mt-0.5 truncate text-[11px] text-muted">{sub}</div>
    </div>
  );
}
