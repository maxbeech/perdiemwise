import type { Metadata } from "next";
import Link from "next/link";
import { US_STATES, locationsInState } from "@/lib/states";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Per Diem Rates by State (FY2026)",
  description: "GSA FY2026 per diem rates for all 50 states and DC. See each state's listed cities and the standard rate that applies everywhere else.",
  alternates: { canonical: "/states" },
};

export default function StatesIndex() {
  return (
    <Container className="py-12 sm:py-16">
      <Eyebrow>By state</Eyebrow>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Per diem rates by state
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Choose a state for its FY2026 GSA per diem cities and the standard rate that covers everywhere else.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {US_STATES.map((s) => {
          const n = locationsInState(s.code).length;
          return (
            <Link key={s.code} href={`/states/${s.slug}`} className="rounded-xl border border-line bg-surface px-4 py-3 transition hover:border-accent/40 hover:shadow-sm">
              <div className="font-medium text-ink">{s.name}</div>
              <div className="mt-0.5 text-xs text-muted">{s.oconus ? "OCONUS rates" : n > 0 ? `${n} listed cities` : "standard rate"}</div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
