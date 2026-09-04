import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { US_STATES, getState, locationsInState } from "@/lib/states";
import { STANDARD_LODGING, STANDARD_MIE, firstLastForMie, FISCAL_YEAR } from "@/lib/gsa";
import { SITE } from "@/lib/site";
import { Container, Eyebrow } from "@/components/ui";

export const dynamicParams = false;
export const revalidate = 604800;

export function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.slug }));
}

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const s = getState(state);
  if (!s) return {};
  return {
    title: `${s.name} Per Diem Rates (FY${FISCAL_YEAR})`,
    description: `GSA FY${FISCAL_YEAR} per diem rates for ${s.name}: listed cities with their lodging and M&IE rates, plus the standard rate for everywhere else.`,
    alternates: { canonical: `/states/${s.slug}` },
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const s = getState(state);
  if (!s) notFound();
  const cities = locationsInState(s.code);

  const highest = cities.length ? cities.reduce((a, b) => (Math.max(...a.lodging) >= Math.max(...b.lodging) ? a : b)) : null;
  const lowest = cities.length > 1 ? cities.reduce((a, b) => (Math.max(...a.lodging) <= Math.max(...b.lodging) ? a : b)) : null;

  const faq = s.oconus
    ? [
        { q: `Does the GSA standard CONUS rate apply in ${s.name}?`, a: `No — ${s.name} is outside the continental United States, so its per diem rates are set by the Department of Defense rather than the GSA CONUS table used on this site.` },
        { q: `Where can I find the ${s.name} per diem rate?`, a: `Look up the DoD's Overseas/Non-Foreign per diem rates for ${s.name} directly, since GSA's CONUS dataset — the one PerDiemWise's calculators use — doesn't cover it.` },
      ]
    : [
        {
          q: `Does every city in ${s.name} have its own per diem rate?`,
          a: cities.length
            ? `No — only ${cities.length} ${cities.length === 1 ? "location has" : "locations have"} a separately listed GSA rate in ${s.name}. Every other city or county in the state uses the standard CONUS rate of ${usd(STANDARD_LODGING)} lodging + ${usd(STANDARD_MIE)} M&IE.`
            : `No — ${s.name} has no separately listed GSA locations, so the entire state uses the standard CONUS rate of ${usd(STANDARD_LODGING)} lodging + ${usd(STANDARD_MIE)} M&IE.`,
        },
        ...(highest && lowest && highest.slug !== lowest.slug
          ? [{ q: `Which city in ${s.name} has the highest per diem rate?`, a: `${highest.city} has the highest listed lodging cap in ${s.name}, at ${usd(Math.max(...highest.lodging))} a night, compared with ${usd(Math.max(...lowest.lodging))} in ${lowest.city}.` }]
          : []),
        { q: `How do I calculate per diem for a multi-city trip through ${s.name}?`, a: `Use the calculator on each city's page for the nights spent there, then add the totals together — lodging caps and M&IE tiers can differ from one ${s.name} city to the next, so a single flat rate for the whole trip would be inaccurate.` },
      ];

  const jsonLd = { "@context": "https://schema.org", "@graph": [{ "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] };

  return (
    <Container className="py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-muted">
        <Link href="/states" className="hover:text-accent">By state</Link>
      </nav>

      <Eyebrow className="mt-4">By state</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {s.name} per diem rates (FY{FISCAL_YEAR})
      </h1>

      {s.oconus ? (
        <p className="mt-5 max-w-2xl rounded-xl bg-clay/10 p-4 text-sm text-clay">
          {s.name} is outside the continental US (OCONUS). Its per diem rates are set by the Department of
          Defense, not the GSA CONUS table, so they aren&apos;t listed here. The standard CONUS rate does not apply.
        </p>
      ) : (
        <p className="mt-3 max-w-2xl text-ink-soft">
          {cities.length > 0
            ? `${s.name} has ${cities.length} ${cities.length === 1 ? "city" : "cities"} with their own GSA rate. Everywhere else in the state uses the standard rate.`
            : `${s.name} has no separately listed GSA cities — the whole state uses the standard CONUS rate.`}
        </p>
      )}

      {!s.oconus && (
        <div className="mt-5 max-w-2xl rounded-xl border border-line bg-paper-2/50 p-4 text-sm">
          <strong className="text-ink">Standard rate (everywhere not listed):</strong>{" "}
          <span className="tnum">{usd(STANDARD_LODGING)}</span> lodging + <span className="tnum">{usd(STANDARD_MIE)}</span> M&amp;IE per day (<span className="tnum">{usd(firstLastForMie(STANDARD_MIE))}</span> first/last day).
        </div>
      )}

      {cities.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2/50 text-left">
              <tr>
                <th className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">City / county</th>
                <th className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">Lodging</th>
                <th className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">M&amp;IE</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((l) => {
                const peak = Math.max(...l.lodging), low = Math.min(...l.lodging);
                return (
                  <tr key={l.slug} className="border-t border-line hover:bg-paper-2/40">
                    <td className="px-4 py-2.5">
                      <Link href={`/per-diem/${l.slug}`} className="font-medium text-accent hover:underline">{l.city}</Link>
                      {l.county ? <span className="text-muted"> · {l.county}</span> : null}
                    </td>
                    <td className="tnum px-4 py-2.5 text-ink-soft">{peak === low ? usd(peak) : `${usd(low)}–${usd(peak)}`}</td>
                    <td className="tnum px-4 py-2.5 text-ink-soft">{usd(l.mie)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <section className="mt-14 max-w-2xl">
        <h2 className="font-display text-xl font-semibold text-ink">About {s.name} per diem</h2>
        <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">
          {s.oconus ? (
            <p>
              {s.name} sits outside the continental United States, so it falls under the Department of Defense&apos;s Overseas/Non-Foreign per diem system rather than the GSA CONUS table this site is built on. If you&apos;re travelling here for federal or federally-reimbursed business, look up the DoD rate directly rather than using the standard CONUS figures elsewhere on this site — see <Link href="/blog/what-is-per-diem" className="text-accent hover:underline">what per diem covers</Link> for how the CONUS and OCONUS systems differ.
            </p>
          ) : (
            <>
              <p>
                {cities.length > 0
                  ? `GSA has surveyed and listed a non-standard rate for ${cities.length} ${cities.length === 1 ? "location" : "locations"} in ${s.name}${highest ? `, topping out at ${usd(Math.max(...highest.lodging))} a night in ${highest.city}` : ""}. Every other city or county in the state defaults to the standard CONUS rate of ${usd(STANDARD_LODGING)} lodging and ${usd(STANDARD_MIE)} M&IE.`
                  : `${s.name} has no city with a separately surveyed GSA rate, so the standard CONUS rate of ${usd(STANDARD_LODGING)} lodging and ${usd(STANDARD_MIE)} M&IE applies statewide.`}
              </p>
              <p>
                On the first and last day of any trip, M&amp;IE is paid at 75% under the <Link href="/blog/gsa-per-diem-first-and-last-day-75-percent-rule" className="text-accent hover:underline">first/last-day rule</Link> — {usd(firstLastForMie(STANDARD_MIE))} at the standard rate{cities.length > 0 ? ", or the equivalent 75% figure for whichever listed city you're travelling to" : ""}. See <Link href="/blog/how-to-calculate-per-diem-for-a-business-trip" className="text-accent hover:underline">how to calculate per diem for a business trip</Link> for the full worked example.
              </p>
            </>
          )}
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold text-ink">Frequently asked questions</h2>
        <div className="mt-4 space-y-4">
          {faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-display text-base font-semibold text-ink">{f.q}</h3>
              <p className="mt-1 leading-relaxed text-ink-soft">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm text-muted">
        <Link href="/calculators/per-diem-calculator" className="text-accent hover:underline">Calculate a trip →</Link>{" "}
        {SITE.name} is an independent tool, not affiliated with the GSA.
      </p>
    </Container>
  );
}
