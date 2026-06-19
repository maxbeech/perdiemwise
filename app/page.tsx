import Link from "next/link";
import PerDiemCalculator from "@/components/PerDiemCalculator";
import MileageCalculator from "@/components/MileageCalculator";
import { Badge, Button, Card, Container, Eyebrow, SectionHead } from "@/components/ui";
import { SITE, IRS_MILEAGE_2026 } from "@/lib/site";
import { FISCAL_YEAR, LOCATIONS, STANDARD_LODGING, STANDARD_MIE } from "@/lib/gsa";
import { US_STATES } from "@/lib/states";

const POPULAR = ["new-york-city-ny", "san-francisco-ca", "washington-dc", "chicago-il", "boston-ma", "los-angeles-ca", "seattle-wa", "denver-co", "austin-tx", "miami-fl", "las-vegas-nv", "san-diego-ca"];

const FAQ = [
  { q: "What is the standard per diem rate for 2026?", a: `For FY${FISCAL_YEAR} the standard CONUS per diem is $${STANDARD_LODGING} for lodging and $${STANDARD_MIE} for meals & incidentals — $${STANDARD_LODGING + STANDARD_MIE} a day combined. Higher-cost cities have their own GSA rates.` },
  { q: "How is per diem calculated on travel days?", a: "Meals & incidentals (M&IE) are paid at 75% on your first and last day of travel and 100% on each full day in between. Lodging is paid per night for each overnight stay, at the rate for that month." },
  { q: "What is the 2026 IRS mileage rate?", a: "The 2026 IRS standard mileage rate is 72.5¢ per mile for business, 20.5¢ for medical or moving, and 14¢ for charitable driving." },
  { q: "Is per diem taxable?", a: "Per diem within the federal rate and backed by an expense report is not taxable. Amounts above the federal rate, or paid without substantiation, become taxable income." },
];

const COMPARE = [
  ["Official GSA FY2026 rates", true, true, false],
  ["75% first & last-day rule, automatic", true, false, false],
  ["Per-night seasonal lodging", true, false, false],
  ["Provided-meal deductions", true, false, false],
  ["IRS mileage in the same place", true, false, false],
  ["Itemised, copy-ready breakdown", true, false, false],
  ["Save & reuse trips", true, false, true],
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="border-b border-line">
        <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-20">
          <div className="rise">
            <Eyebrow>GSA {SITE.fyShort} · IRS 2026 · official rates</Eyebrow>
            <h1 className="mt-5 font-display text-[2.7rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl">
              Per diem &amp; mileage,<br /><span className="text-accent">calculated correctly.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              The free calculator that turns the official GSA {SITE.fyShort} lodging &amp; M&amp;IE rates into an
              itemised trip total — the 75% first-and-last-day rule built in — plus IRS-rate mileage. Real
              government data, not a guess.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button href="/calculators/per-diem-calculator" size="lg">Calculate a trip</Button>
              <Button href="/per-diem" variant="outline" size="lg">Browse rates by city</Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[[`${LOCATIONS.length}`, "GSA cities"], [`${US_STATES.length}`, "states + DC"], [`$${STANDARD_LODGING + STANDARD_MIE}`, "standard / day"]].map(([n, l]) => (
                <div key={l}><dt className="tnum text-2xl font-semibold text-ink">{n}</dt><dd className="mt-0.5 text-xs uppercase tracking-wide text-muted">{l}</dd></div>
              ))}
            </dl>
          </div>
          <div className="rise" style={{ animationDelay: "0.12s" }}>
            <PerDiemCalculator />
          </div>
        </Container>
      </section>

      {/* Trust strip */}
      <section className="border-b border-line bg-paper-2/40">
        <Container className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:justify-center sm:gap-8 sm:text-left">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Sourced from</span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-ink-soft">
            <span className="font-medium">U.S. General Services Administration · {SITE.fyShort}</span>
            <span className="hidden h-4 w-px bg-line-strong sm:block" />
            <span className="font-medium">IRS standard mileage rates · 2026</span>
            <span className="hidden h-4 w-px bg-line-strong sm:block" />
            <Link href="/methodology" className="text-accent hover:underline">See our methodology →</Link>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-20"><Container>
        <SectionHead eyebrow="How it works" title="Built the way a travel voucher actually adds up" lede="Three rules trip people up when they do this by hand. PerDiemWise applies all three, every time." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["01", "Lodging, per night", "Each night is capped at that city's GSA rate for the month it falls in — seasonal rates handled automatically."],
            ["02", "M&IE at 75% on travel days", "Meals & incidentals pay full on whole days and 75% on the first and last day, with provided meals deducted."],
            ["03", "Mileage at the IRS rate", `Personal-vehicle miles reimbursed at the 2026 IRS rate of ${(IRS_MILEAGE_2026.rates.business * 100).toFixed(1)}¢ — in the same place.`],
          ].map(([n, h, p]) => (
            <Card key={n} className="p-6">
              <span className="tnum text-sm text-accent">{n}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p}</p>
            </Card>
          ))}
        </div>
      </Container></section>

      {/* Comparison */}
      <section className="border-y border-line bg-paper-2/30 py-20"><Container>
        <SectionHead eyebrow="Why not a spreadsheet" title="The official rate, without the manual maths" />
        <Card className="mt-8 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line text-left">
              <th className="px-5 py-4 font-medium text-muted">Capability</th>
              <th className="px-4 py-4 text-center font-semibold text-accent">PerDiemWise</th>
              <th className="px-4 py-4 text-center font-medium text-muted">gsa.gov lookup</th>
              <th className="px-4 py-4 text-center font-medium text-muted">Spreadsheet</th>
            </tr></thead>
            <tbody>
              {COMPARE.map(([label, a, b, c]) => (
                <tr key={label as string} className="border-b border-line last:border-0">
                  <td className="px-5 py-3.5 text-ink-soft">{label}</td>
                  {[a, b, c].map((v, i) => (
                    <td key={i} className="px-4 py-3.5 text-center">{v ? <span className={i === 0 ? "text-accent" : "text-ink-soft"}>✓</span> : <span className="text-line-strong">—</span>}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Container></section>

      {/* Mileage callout */}
      <section className="py-20"><Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>Mileage too</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Reimburse miles at the exact 2026 IRS rate</h2>
          <p className="mt-3 text-lg leading-relaxed text-muted">Business, medical or charitable, multi-leg — totalled to the cent and ready for an expense report. No more looking up this year&apos;s cents-per-mile.</p>
          <Button href="/calculators/mileage-reimbursement-calculator" variant="outline" className="mt-6">Open the mileage calculator</Button>
        </div>
        <MileageCalculator />
      </Container></section>

      {/* Popular destinations */}
      <section className="border-t border-line py-20"><Container>
        <div className="flex items-end justify-between">
          <SectionHead eyebrow="Per diem rates" title="Popular destinations" />
          <Link href="/per-diem" className="hidden shrink-0 text-sm font-medium text-accent hover:underline sm:block">All {LOCATIONS.length} cities →</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {POPULAR.map((slug) => {
            const loc = LOCATIONS.find((l) => l.slug === slug);
            if (!loc) return null;
            return (
              <Link key={slug} href={`/per-diem/${slug}`} className="group rounded-xl border border-line bg-surface p-4 transition hover:border-accent/40 hover:shadow-sm">
                <div className="font-medium text-ink group-hover:text-accent">{loc.city}, {loc.state}</div>
                <div className="tnum mt-1 text-xs text-muted">${Math.min(...loc.lodging)}–${Math.max(...loc.lodging)} lodging · ${loc.mie} M&amp;IE</div>
              </Link>
            );
          })}
        </div>
        <div className="mt-5 sm:hidden"><Link href="/per-diem" className="text-sm font-medium text-accent hover:underline">All {LOCATIONS.length} cities →</Link></div>
      </Container></section>

      {/* FAQ */}
      <section className="border-t border-line bg-paper-2/30 py-20"><Container>
        <SectionHead eyebrow="FAQ" title="Per diem, answered" />
        <div className="mx-auto mt-8 max-w-3xl divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink [&::-webkit-details-marker]:hidden">{f.q}<span className="ml-4 text-accent transition group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Container></section>

      {/* Final CTA */}
      <section className="py-20"><Container>
        <div className="overflow-hidden rounded-3xl border border-accent-dark/20 bg-accent px-8 py-14 text-center text-white sm:px-16">
          <Badge tone="ink"><span className="text-white/90">Free forever</span></Badge>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your next trip&apos;s per diem is two dates away</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Official GSA {SITE.fyShort} rates, itemised and copy-ready. No sign-up needed to calculate.</p>
          <div className="mt-7 flex justify-center"><Button href="/calculators/per-diem-calculator" variant="secondary" size="lg" className="!bg-white !text-accent-dark hover:!bg-paper">Calculate a trip</Button></div>
        </div>
      </Container></section>
    </>
  );
}
