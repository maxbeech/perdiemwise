import type { Metadata } from "next";
import Link from "next/link";
import { FISCAL_YEAR_LABEL, GSA_SOURCE, MIE_BREAKDOWN, STANDARD_LODGING, STANDARD_MIE, LOCATIONS } from "@/lib/gsa";
import { IRS_MILEAGE_2026 } from "@/lib/site";

export const metadata: Metadata = {
  title: "Methodology & Data Sources",
  description: "Where PerDiemWise's per diem and mileage figures come from — the official GSA FY2026 CONUS rates and the 2026 IRS standard mileage rates — and exactly how each calculation is made.",
  alternates: { canonical: "/methodology" },
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function Methodology() {
  return (
    <article className="prose-stone max-w-none">
      <h1 className="text-3xl font-extrabold text-stone-900">Methodology &amp; data sources</h1>
      <p className="mt-3 text-stone-600">
        Every rate on PerDiemWise comes from an official US government source. We do not estimate or
        invent figures — when a destination isn&apos;t separately listed by GSA, we say so and apply the
        published standard rate.
      </p>

      <h2 className="mt-8 text-xl font-bold text-stone-900">Per diem rates — GSA</h2>
      <ul className="mt-2 space-y-1 text-stone-600">
        <li><strong>Source:</strong> {GSA_SOURCE.name}.</li>
        <li><strong>Coverage:</strong> {FISCAL_YEAR_LABEL}; {LOCATIONS.length} non-standard CONUS cities and counties plus the standard rate.</li>
        <li><strong>Standard CONUS rate:</strong> {usd(STANDARD_LODGING)} lodging + {usd(STANDARD_MIE)} M&amp;IE = {usd(STANDARD_LODGING + STANDARD_MIE)}/day.</li>
        <li><strong>Retrieved:</strong> {GSA_SOURCE.fetched}, via the GSA per diem API (<code className="text-xs">{GSA_SOURCE.api}</code>).</li>
        <li><strong>Reference:</strong> <a href={GSA_SOURCE.url} className="text-sky-700 hover:underline" rel="nofollow">gsa.gov/travel/plan-book/per-diem-rates</a>.</li>
      </ul>

      <h2 className="mt-8 text-xl font-bold text-stone-900">How a trip is calculated</h2>
      <ul className="mt-2 space-y-1 text-stone-600">
        <li><strong>Lodging</strong> is paid per night, capped at the destination&apos;s rate for the month that night falls in (GSA lodging caps can change by season).</li>
        <li><strong>M&amp;IE</strong> is paid at 100% on full days and at <strong>75% on the first and last travel day</strong> (FTR §301-11.101).</li>
        <li>A same-day trip with no overnight uses the 75% M&amp;IE amount and no lodging.</li>
      </ul>

      <h3 className="mt-6 text-lg font-semibold text-stone-900">FY2026 M&amp;IE tiers</h3>
      <div className="mt-2 overflow-hidden rounded-xl border border-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-stone-500"><tr><th className="px-3 py-2">Total</th><th className="px-3 py-2">Breakfast</th><th className="px-3 py-2">Lunch</th><th className="px-3 py-2">Dinner</th><th className="px-3 py-2">Incidentals</th><th className="px-3 py-2">First/last (75%)</th></tr></thead>
          <tbody>
            {MIE_BREAKDOWN.map((t) => (
              <tr key={t.total} className="border-t border-stone-100">
                <td className="px-3 py-2 font-medium">{usd(t.total)}</td><td className="px-3 py-2">{usd(t.breakfast)}</td><td className="px-3 py-2">{usd(t.lunch)}</td><td className="px-3 py-2">{usd(t.dinner)}</td><td className="px-3 py-2">{usd(t.incidental)}</td><td className="px-3 py-2">{usd(t.firstLast)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-xl font-bold text-stone-900">Mileage rates — IRS</h2>
      <ul className="mt-2 space-y-1 text-stone-600">
        <li><strong>Source:</strong> IRS 2026 optional standard mileage rates, effective {IRS_MILEAGE_2026.effective}.</li>
        <li><strong>Business:</strong> {(IRS_MILEAGE_2026.rates.business * 100).toFixed(1)}¢/mi · <strong>Medical/moving:</strong> {(IRS_MILEAGE_2026.rates.medical * 100).toFixed(1)}¢/mi · <strong>Charitable:</strong> {(IRS_MILEAGE_2026.rates.charity * 100).toFixed(1)}¢/mi.</li>
        <li><strong>Reference:</strong> <a href={IRS_MILEAGE_2026.sourceUrl} className="text-sky-700 hover:underline" rel="nofollow">irs.gov — 2026 standard mileage rates</a>.</li>
      </ul>

      <p className="mt-8 rounded-xl bg-stone-100 p-4 text-sm text-stone-600">
        PerDiemWise is an independent planning tool and is not affiliated with or endorsed by the GSA
        or the IRS. Always confirm figures against your organisation&apos;s travel policy and the official
        publications before filing a claim. Questions? <Link href="/blog" className="text-sky-700 hover:underline">Read the guides</Link>.
      </p>
    </article>
  );
}
