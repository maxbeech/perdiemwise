import type { Metadata } from "next";
import Link from "next/link";
import { LOCATIONS } from "@/lib/gsa";
import { US_STATES, stateName } from "@/lib/states";

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
    <div>
      <h1 className="text-3xl font-extrabold text-stone-900">GSA per diem rates by city</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        The {LOCATIONS.length} CONUS cities and counties with their own FY2026 GSA rate. Anywhere not listed
        uses the standard rate ($110 lodging / $68 M&amp;IE). Pick a city for its monthly lodging caps and a trip calculator.
      </p>

      <div className="mt-8 space-y-8">
        {states.map((s) => (
          <section key={s.code}>
            <h2 className="mb-2 flex items-baseline gap-2 text-lg font-bold text-stone-900">
              <Link href={`/states/${s.slug}`} className="hover:text-sky-700">{stateName(s.code)}</Link>
              <span className="text-sm font-normal text-stone-400">{byState.get(s.code)!.length} cities</span>
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3 md:grid-cols-4">
              {byState.get(s.code)!.map((l) => (
                <Link key={l.slug} href={`/per-diem/${l.slug}`} className="truncate py-0.5 text-stone-600 hover:text-sky-700">
                  {l.city} <span className="text-stone-400">${l.mie}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
