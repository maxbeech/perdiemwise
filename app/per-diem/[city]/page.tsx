import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PerDiemCalculator from "@/components/PerDiemCalculator";
import RateTable from "@/components/RateTable";
import { LOCATIONS, getLocation, firstLastForMie, FISCAL_YEAR } from "@/lib/gsa";
import { stateName, stateSlug, locationsInState } from "@/lib/states";
import { SITE } from "@/lib/site";

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
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is the per diem rate for ${loc.city}, ${loc.state}?`, acceptedAnswer: { "@type": "Answer", text: `For FY${FISCAL_YEAR}, ${loc.city} has a GSA lodging rate of ${seasonal ? `${usd(low)}–${usd(peak)} depending on the month` : usd(peak)} per night and a meals & incidentals rate of ${usd(loc.mie)} per day (${usd(firstLastForMie(loc.mie))} on the first and last travel day).` } },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-stone-500"><Link href="/per-diem" className="hover:text-sky-700">Per diem rates</Link> · <Link href={`/states/${stateSlug(loc.state)}`} className="hover:text-sky-700">{stateName(loc.state)}</Link></nav>
      <h1 className="mt-2 text-3xl font-extrabold text-stone-900">{loc.city}, {loc.state} per diem rates</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        Official FY{FISCAL_YEAR} GSA per diem for {loc.city}{loc.county ? ` (${loc.county} County)` : ""}, {stateName(loc.state)}.
        Lodging is capped at {seasonal ? `${usd(low)}–${usd(peak)} per night depending on the season` : `${usd(peak)} per night`}, and
        meals &amp; incidentals are {usd(loc.mie)} per day ({usd(firstLastForMie(loc.mie))} on your first and last travel day).
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-bold text-stone-900">{loc.city} rate table</h2>
          <RateTable loc={loc} />
          {seasonal && <p className="mt-2 text-xs text-stone-500">Lodging changes by month here — the calculator uses the right rate for each night of your trip.</p>}
        </div>
        <div>
          <h2 className="mb-2 text-lg font-bold text-stone-900">Calculate a trip to {loc.city}</h2>
          <PerDiemCalculator initialSlug={loc.slug} />
        </div>
      </div>

      {siblings.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-stone-900">Other {stateName(loc.state)} per diem rates</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {siblings.map((l) => (
              <Link key={l.slug} href={`/per-diem/${l.slug}`} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-stone-600 hover:border-sky-300">{l.city}</Link>
            ))}
          </div>
        </section>
      )}
      <p className="mt-8 text-sm text-stone-500">Rates from the <Link href="/methodology" className="text-sky-700 hover:underline">GSA FY{FISCAL_YEAR} dataset</Link>. {SITE.name} is an independent tool, not affiliated with the GSA.</p>
    </div>
  );
}
