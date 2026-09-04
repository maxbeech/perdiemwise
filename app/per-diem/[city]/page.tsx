import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PerDiemCalculator from "@/components/PerDiemCalculator";
import RateTable from "@/components/RateTable";
import { LOCATIONS, getLocation, firstLastForMie, STANDARD_LODGING, STANDARD_MIE, FISCAL_YEAR } from "@/lib/gsa";
import { stateName, stateSlug, locationsInState } from "@/lib/states";
import { SITE } from "@/lib/site";
import { Container, Eyebrow } from "@/components/ui";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const dynamicParams = false;
export const revalidate = 604800; // 1 week

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ city: l.slug }));
}

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) return {};
  const peak = Math.max(...loc.lodging);
  const low = Math.min(...loc.lodging);
  const range = peak === low ? usd(peak) : `${usd(low)}–${usd(peak)}`;
  return {
    title: `${loc.city}, ${loc.state} Per Diem Rates (FY${FISCAL_YEAR})`,
    description: `FY${FISCAL_YEAR} GSA per diem for ${loc.city}, ${stateName(loc.state)}: ${range} lodging per night and ${usd(loc.mie)} meals & incidentals per day. Calculate your trip total.`,
    alternates: { canonical: `/per-diem/${loc.slug}` },
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) notFound();

  const peak = Math.max(...loc.lodging);
  const low = Math.min(...loc.lodging);
  const seasonal = peak !== low;
  const siblings = locationsInState(loc.state).filter((l) => l.slug !== loc.slug).slice(0, 12);

  const peakMonths = MONTHS.filter((_, i) => loc.lodging[i] === peak);
  const lowMonths = MONTHS.filter((_, i) => loc.lodging[i] === low);
  const lodgingDelta = peak - STANDARD_LODGING;
  const mieDelta = loc.mie - STANDARD_MIE;

  const faq = [
    { q: `What is the per diem rate for ${loc.city}, ${loc.state}?`, a: `For FY${FISCAL_YEAR}, ${loc.city} has a GSA lodging rate of ${seasonal ? `${usd(low)}–${usd(peak)} depending on the month` : usd(peak)} per night and a meals & incidentals rate of ${usd(loc.mie)} per day (${usd(firstLastForMie(loc.mie))} on the first and last travel day).` },
    { q: `Does the ${loc.city} per diem rate change by season?`, a: seasonal ? `Yes. The lodging cap peaks at ${usd(peak)} a night in ${peakMonths.join(", ")}, and drops to ${usd(low)} a night in ${lowMonths.join(", ")}. Book against the rate for your actual travel month, not the yearly figure.` : `No — ${loc.city} has a flat lodging cap of ${usd(peak)} a night all year, so there is no seasonal adjustment to account for.` },
    { q: `How does ${loc.city} compare to the standard CONUS per diem rate?`, a: `The standard rate that applies to most of the US is ${usd(STANDARD_LODGING)} lodging + ${usd(STANDARD_MIE)} M&IE. ${loc.city}'s peak lodging cap is ${lodgingDelta === 0 ? "the same as" : `${usd(Math.abs(lodgingDelta))} ${lodgingDelta > 0 ? "higher than" : "lower than"}`} standard, and its M&IE rate is ${mieDelta === 0 ? "the same as" : `${usd(Math.abs(mieDelta))} ${mieDelta > 0 ? "higher than" : "lower than"}`} standard — reflecting GSA's local cost-of-travel survey for this destination.` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Per diem rates", item: `${SITE.url}/per-diem` },
          { "@type": "ListItem", position: 2, name: stateName(loc.state), item: `${SITE.url}/states/${stateSlug(loc.state)}` },
          { "@type": "ListItem", position: 3, name: `${loc.city}, ${loc.state}`, item: `${SITE.url}/per-diem/${loc.slug}` },
        ],
      },
    ],
  };

  return (
    <Container className="py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-muted">
        <Link href="/per-diem" className="hover:text-accent">Per diem rates</Link>
        {" · "}
        <Link href={`/states/${stateSlug(loc.state)}`} className="hover:text-accent">{stateName(loc.state)}</Link>
      </nav>

      <Eyebrow className="mt-4">Per diem rates</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {loc.city}, {loc.state} per diem rates
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Official FY{FISCAL_YEAR} GSA per diem for {loc.city}{loc.county ? ` (${loc.county} County)` : ""}, {stateName(loc.state)}.
        Lodging is capped at {seasonal ? `${usd(low)}–${usd(peak)} per night depending on the season` : `${usd(peak)} per night`}, and
        meals &amp; incidentals are {usd(loc.mie)} per day ({usd(firstLastForMie(loc.mie))} on your first and last travel day).
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">{loc.city} rate table</h2>
          <RateTable loc={loc} />
          {seasonal && <p className="mt-2 text-xs text-muted">Lodging changes by month here — the calculator uses the right rate for each night of your trip.</p>}
        </div>
        <div>
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">Calculate a trip to {loc.city}</h2>
          <PerDiemCalculator initialSlug={loc.slug} />
        </div>
      </div>

      {siblings.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-ink">Other {stateName(loc.state)} per diem rates</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {siblings.map((l) => (
              <Link key={l.slug} href={`/per-diem/${l.slug}`} className="rounded-xl border border-line bg-surface px-3 py-1.5 text-ink-soft hover:border-accent/40 hover:shadow-sm">{l.city}</Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 max-w-2xl">
        <h2 className="font-display text-xl font-semibold text-ink">About {loc.city} per diem</h2>
        <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">
          <p>
            {loc.city}&apos;s FY{FISCAL_YEAR} lodging cap is {lodgingDelta === 0 ? `the same as the ${usd(STANDARD_LODGING)} standard CONUS rate` : `${usd(Math.abs(lodgingDelta))} ${lodgingDelta > 0 ? "above" : "below"} the ${usd(STANDARD_LODGING)} standard CONUS rate`} that applies to most of the country, and its {usd(loc.mie)} M&amp;IE rate is {mieDelta === 0 ? "in line with" : `${usd(Math.abs(mieDelta))} ${mieDelta > 0 ? "above" : "below"}`} the {usd(STANDARD_MIE)} standard. GSA sets non-standard rates like this one after surveying actual lodging costs in the area, rather than applying a single nationwide figure — see <Link href="/blog/standard-conus-per-diem-rate-explained" className="text-accent hover:underline">how the standard rate compares to listed cities</Link> for the full mechanics.
          </p>
          <p>
            {seasonal
              ? `Lodging here isn't flat year-round: the cap runs highest at ${usd(peak)} a night in ${peakMonths.join(", ")}, and falls to ${usd(low)} a night in ${lowMonths.join(", ")}. A trip that starts in a peak month and ends in a low month is billed at each night's own rate, which is exactly what the calculator above does automatically — see our guide to how lodging rates change by season.`
              : `Lodging here holds flat at ${usd(peak)} a night in every month of FY${FISCAL_YEAR}, so there's no seasonal adjustment to plan around.`}
            {" "}On your first and last travel day, M&amp;IE drops to {usd(firstLastForMie(loc.mie))} under the <Link href="/blog/gsa-per-diem-first-and-last-day-75-percent-rule" className="text-accent hover:underline">75% first/last-day rule</Link> — full days in between are paid at the full {usd(loc.mie)}.
          </p>
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
        Rates from the{" "}
        <Link href="/methodology" className="text-accent hover:underline">GSA FY{FISCAL_YEAR} dataset</Link>.{" "}
        {SITE.name} is an independent tool, not affiliated with the GSA.
      </p>
    </Container>
  );
}
