import Link from "next/link";
import PerDiemCalculator from "@/components/PerDiemCalculator";
import MileageCalculator from "@/components/MileageCalculator";
import { SITE, IRS_MILEAGE_2026 } from "@/lib/site";
import { FISCAL_YEAR_LABEL, LOCATIONS, STANDARD_LODGING, STANDARD_MIE } from "@/lib/gsa";

const POPULAR = ["new-york-city-ny", "san-francisco-ca", "washington-dc", "chicago-il", "boston-ma", "los-angeles-ca", "seattle-wa", "denver-co", "austin-tx", "miami-fl", "las-vegas-nv", "san-diego-ca"];

const FAQ = [
  { q: "What is the standard per diem rate for 2026?", a: `For FY2026 the standard CONUS per diem is $${STANDARD_LODGING} for lodging and $${STANDARD_MIE} for meals & incidentals — $${STANDARD_LODGING + STANDARD_MIE} a day combined. Higher-cost cities have their own GSA rates.` },
  { q: "How is per diem calculated on travel days?", a: "Meals & incidentals (M&IE) are paid at 75% on your first and last day of travel and at 100% on each full day in between. Lodging is paid per night for each overnight stay." },
  { q: "What is the 2026 IRS mileage rate?", a: "The 2026 IRS standard mileage rate is 72.5¢ per mile for business, 20.5¢ for medical or moving, and 14¢ for charitable driving." },
  { q: "Is per diem taxable?", a: "Per diem within the federal rate and backed by an expense report is not taxable. Amounts above the federal rate, or paid without substantiation, become taxable income." },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", name: SITE.name, url: SITE.url, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: SITE.description },
      { "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
          Per diem &amp; mileage, <span className="text-sky-600">done right</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
          Calculate a business trip&apos;s per diem from the official GSA {FISCAL_YEAR_LABEL.split(" (")[0]} rates — with the
          75% first-and-last-day rule built in — plus mileage at the 2026 IRS rate. Free, accurate, itemised.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Per diem trip calculator</h2>
        <PerDiemCalculator />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Mileage reimbursement (2026 IRS rate)</h2>
        <MileageCalculator />
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-stone-900">Popular per diem destinations</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {POPULAR.map((slug) => {
            const loc = LOCATIONS.find((l) => l.slug === slug);
            if (!loc) return null;
            return (
              <Link key={slug} href={`/per-diem/${slug}`} className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm hover:border-sky-300 hover:shadow-sm">
                <div className="font-medium text-stone-900">{loc.city}, {loc.state}</div>
                <div className="text-xs text-stone-500">${loc.lodging[0]}–${Math.max(...loc.lodging)} lodging · ${loc.mie} M&amp;IE</div>
              </Link>
            );
          })}
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <Link href="/per-diem" className="font-medium text-sky-700 hover:underline">All {LOCATIONS.length} GSA cities →</Link>
          <Link href="/states" className="font-medium text-sky-700 hover:underline">Browse by state →</Link>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-xl font-bold text-stone-900">How per diem works</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3 text-sm text-stone-600">
          <div><div className="font-semibold text-stone-900">1. Lodging, per night</div>Each night is capped at the GSA rate for that city and month. Seasonal cities cost more in peak months.</div>
          <div><div className="font-semibold text-stone-900">2. M&amp;IE, per day</div>A flat meals &amp; incidentals allowance — full on travel-in-between days, 75% on the first and last day.</div>
          <div><div className="font-semibold text-stone-900">3. Mileage, on top</div>Personal-vehicle miles are reimbursed separately at the 2026 IRS rate of {(IRS_MILEAGE_2026.rates.business * 100).toFixed(1)}¢.</div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-stone-900">Frequently asked questions</h2>
        <dl className="mt-3 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {FAQ.map((f) => (
            <div key={f.q} className="p-4">
              <dt className="font-semibold text-stone-900">{f.q}</dt>
              <dd className="mt-1 text-sm text-stone-600">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
