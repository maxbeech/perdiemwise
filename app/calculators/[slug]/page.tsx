import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CALCS, getCalc } from "@/lib/calculators";
import PerDiemCalculator from "@/components/PerDiemCalculator";
import MileageCalculator from "@/components/MileageCalculator";
import MieCalculator from "@/components/MieCalculator";
import { Container, Eyebrow } from "@/components/ui";

export const dynamicParams = false;
export const revalidate = 604800;

export function generateStaticParams() {
  return CALCS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCalc(slug);
  if (!c) return {};
  return { title: c.title, description: c.description, alternates: { canonical: `/calculators/${c.slug}` } };
}

export default async function CalcPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCalc(slug);
  if (!c) notFound();

  return (
    <Container className="py-12 sm:py-16">
      <nav className="text-sm text-muted">
        <Link href="/calculators" className="hover:text-accent">Calculators</Link>
      </nav>

      <Eyebrow className="mt-4">Calculators</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{c.h1}</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">{c.intro}</p>

      <div className="mt-8">
        {c.tool === "perdiem" && <PerDiemCalculator />}
        {c.tool === "mileage" && <MileageCalculator />}
        {c.tool === "mie" && <MieCalculator />}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        {CALCS.filter((o) => o.slug !== c.slug).map((o) => (
          <Link key={o.slug} href={`/calculators/${o.slug}`} className="rounded-xl border border-line bg-surface px-3 py-1.5 text-ink-soft hover:border-accent/40 hover:shadow-sm">{o.h1}</Link>
        ))}
        <Link href="/methodology" className="rounded-xl border border-line bg-surface px-3 py-1.5 text-ink-soft hover:border-accent/40 hover:shadow-sm">How it&apos;s calculated</Link>
      </div>
    </Container>
  );
}
