import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PerDiemCalculator from "@/components/PerDiemCalculator";
import RateTable from "@/components/RateTable";
import { LOCATIONS, getLocation, firstLastForMie, FISCAL_YEAR } from "@/lib/gsa";
import { stateName, stateSlug, locationsInState } from "@/lib/states";
import { SITE } from "@/lib/site";
import { Container, Eyebrow } from "@/components/ui";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: `What is the per diem rate for ${loc.city}, ${loc.state}?`, acceptedAnswer: { "@type": "Answer", text: `For FY${FISCAL_YEAR}, ${loc.city} has a GSA lodging rate of ${seasonal ? `${usd(low)}–${usd(peak)} depending on the month` : usd(peak)} per night and a meals & incidentals rate of ${usd(loc.mie)} per day (${usd(firstLastForMie(loc.mie))} on the first and last travel day).` } },
        ],
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

      <p className="mt-10 text-sm text-muted">
        Rates from the{" "}
        <Link href="/methodology" className="text-accent hover:underline">GSA FY{FISCAL_YEAR} dataset</Link>.{" "}
        {SITE.name} is an independent tool, not affiliated with the GSA.
      </p>
    </Container>
  );
}
