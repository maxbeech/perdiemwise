import type { Metadata } from "next";
import Link from "next/link";
import { FISCAL_YEAR_LABEL, GSA_SOURCE, MIE_BREAKDOWN, STANDARD_LODGING, STANDARD_MIE, LOCATIONS } from "@/lib/gsa";
import { IRS_MILEAGE_2026 } from "@/lib/site";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Methodology & Data Sources",
  description: "Where PerDiemWise's per diem and mileage figures come from — the official GSA FY2026 CONUS rates and the 2026 IRS standard mileage rates — and exactly how each calculation is made.",
  alternates: { canonical: "/methodology" },
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function Methodology() {
  return (
    <Container className="py-12 sm:py-16">
      <Eyebrow>Reference</Eyebrow>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Methodology &amp; data sources
      </h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        Every rate on PerDiemWise comes from an official US government source. We do not estimate or
        invent figures — when a destination isn&apos;t separately listed by GSA, we say so and apply the
        published standard rate.
      </p>

      <div className="mx-auto mt-10 max-w-3xl space-y-10">
        {/* GSA per diem */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Per diem rates — GSA</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
            <li><strong className="text-ink">Source:</strong> {GSA_SOURCE.name}.</li>
            <li><strong className="text-ink">Coverage:</strong> {FISCAL_YEAR_LABEL}; {LOCATIONS.length} non-standard CONUS cities and counties plus the standard rate.</li>
            <li>
              <strong className="text-ink">Standard CONUS rate:</strong>{" "}
              <span className="tnum">{usd(STANDARD_LODGING)}</span> lodging + <span className="tnum">{usd(STANDARD_MIE)}</span> M&amp;IE = <span className="tnum">{usd(STANDARD_LODGING + STANDARD_MIE)}</span>/day.
            </li>
            <li><strong className="text-ink">Retrieved:</strong> {GSA_SOURCE.fetched}, via the GSA per diem API (<code className="rounded bg-paper-2 px-1 py-0.5 font-mono text-xs text-ink-soft">{GSA_SOURCE.api}</code>).</li>
            <li>
              <strong className="text-ink">Reference:</strong>{" "}
              <a href={GSA_SOURCE.url} className="text-accent hover:underline" rel="nofollow">gsa.gov/travel/plan-book/per-diem-rates</a>.
            </li>
          </ul>
        </section>

        {/* How a trip is calculated */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">How a trip is calculated</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
            <li><strong className="text-ink">Lodging</strong> is paid per night, capped at the destination&apos;s rate for the month that night falls in (GSA lodging caps can change by season).</li>
            <li><strong className="text-ink">M&amp;IE</strong> is paid at 100% on full days and at <strong className="text-ink">75% on the first and last travel day</strong> (FTR §301-11.101).</li>
            <li>A same-day trip with no overnight uses the 75% M&amp;IE amount and no lodging.</li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink">FY2026 M&amp;IE tiers</h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-paper-2/50">
                <tr>
                  {["Total", "Breakfast", "Lunch", "Dinner", "Incidentals", "First/last (75%)"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-mono text-[11px] uppercase tracking-wide text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MIE_BREAKDOWN.map((t) => (
                  <tr key={t.total} className="border-t border-line">
                    <td className="tnum px-3 py-2 font-medium text-ink">{usd(t.total)}</td>
                    <td className="tnum px-3 py-2 text-ink-soft">{usd(t.breakfast)}</td>
                    <td className="tnum px-3 py-2 text-ink-soft">{usd(t.lunch)}</td>
                    <td className="tnum px-3 py-2 text-ink-soft">{usd(t.dinner)}</td>
                    <td className="tnum px-3 py-2 text-ink-soft">{usd(t.incidental)}</td>
                    <td className="tnum px-3 py-2 text-ink-soft">{usd(t.firstLast)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* IRS mileage */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Mileage rates — IRS</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
            <li><strong className="text-ink">Source:</strong> IRS 2026 optional standard mileage rates, effective {IRS_MILEAGE_2026.effective}.</li>
            <li>
              <strong className="text-ink">Business:</strong>{" "}
              <span className="tnum">{(IRS_MILEAGE_2026.rates.business * 100).toFixed(1)}¢/mi</span>
              {" · "}
              <strong className="text-ink">Medical/moving:</strong>{" "}
              <span className="tnum">{(IRS_MILEAGE_2026.rates.medical * 100).toFixed(1)}¢/mi</span>
              {" · "}
              <strong className="text-ink">Charitable:</strong>{" "}
              <span className="tnum">{(IRS_MILEAGE_2026.rates.charity * 100).toFixed(1)}¢/mi</span>.
            </li>
            <li>
              <strong className="text-ink">Reference:</strong>{" "}
              <a href={IRS_MILEAGE_2026.sourceUrl} className="text-accent hover:underline" rel="nofollow">irs.gov — 2026 standard mileage rates</a>.
            </li>
          </ul>
        </section>

        {/* Disclaimer */}
        <p className="rounded-xl bg-paper-2 p-4 text-sm text-muted">
          PerDiemWise is an independent planning tool and is not affiliated with or endorsed by the GSA
          or the IRS. Always confirm figures against your organisation&apos;s travel policy and the official
          publications before filing a claim. Questions?{" "}
          <Link href="/blog" className="text-accent hover:underline">Read the guides</Link>.
        </p>
      </div>
    </Container>
  );
}
