import type { Metadata } from "next";
import Link from "next/link";
import { LOCATIONS } from "@/lib/gsa";
import { US_STATES, stateName } from "@/lib/states";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "GSA Per Diem Rates by City (FY2026)",
  description: "Browse the official FY2026 GSA per diem rates for every non-standard CONUS city — lodging and meals & incidentals — and calculate a trip in one click.",
  alternates: { canonical: "/per-diem" },
};

export default function PerDiemIndex() {
  const byState = new Map<string, typeof LOCATIONS>();
  for (const l of LOCATIONS) {
    const arr = byState.get(l.state) ?? [];
    arr.push(l);
    byState.set(l.state, arr);
  }
  const states = US_STATES.filter((s) => byState.has(s.code));

  return (
    <Container className="py-12 sm:py-16">
      <Eyebrow>Per diem rates</Eyebrow>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        GSA per diem rates by city
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        The {LOCATIONS.length} CONUS cities and counties with their own FY2026 GSA rate. Anywhere not listed
        uses the standard rate ($110 lodging / $68 M&amp;IE). Pick a city for its monthly lodging caps and a trip calculator.
      </p>

      <div className="mt-10 space-y-10">
        {states.map((s) => (
          <section key={s.code}>
            <h2 className="mb-3 flex items-baseline gap-2 font-display text-xl font-semibold text-ink">
              <Link href={`/states/${s.slug}`} className="hover:text-accent">{stateName(s.code)}</Link>
              <span className="font-mono text-sm font-normal text-muted">{byState.get(s.code)!.length} cities</span>
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3 md:grid-cols-4">
              {byState.get(s.code)!.map((l) => (
                <Link key={l.slug} href={`/per-diem/${l.slug}`} className="truncate py-0.5 text-ink-soft hover:text-accent">
                  {l.city} <span className="tnum text-muted">${l.mie}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
