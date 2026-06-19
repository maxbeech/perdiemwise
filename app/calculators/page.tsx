import type { Metadata } from "next";
import Link from "next/link";
import { CALCS } from "@/lib/calculators";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Per Diem & Mileage Calculators",
  description: "Free calculators for federal travel: GSA per diem trips, IRS mileage reimbursement, and the meals & incidentals (M&IE) breakdown.",
  alternates: { canonical: "/calculators" },
};

export default function CalculatorsIndex() {
  return (
    <Container className="py-12 sm:py-16">
      <Eyebrow>Calculators</Eyebrow>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Calculators
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Free, accurate tools built on the official GSA FY2026 per diem rates and the 2026 IRS mileage rates.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {CALCS.map((c) => (
          <Link key={c.slug} href={`/calculators/${c.slug}`} className="rounded-2xl border border-line bg-surface p-5 transition hover:border-accent/40 hover:shadow-sm">
            <h2 className="font-display text-xl font-semibold text-ink">{c.h1}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.description}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
