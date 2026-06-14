import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CALCS, getCalc } from "@/lib/calculators";
import PerDiemCalculator from "@/components/PerDiemCalculator";
import MileageCalculator from "@/components/MileageCalculator";
import MieCalculator from "@/components/MieCalculator";

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
    <div>
      <nav className="text-sm text-stone-500"><Link href="/calculators" className="hover:text-sky-700">Calculators</Link></nav>
      <h1 className="mt-2 text-3xl font-extrabold text-stone-900">{c.h1}</h1>
      <p className="mt-2 max-w-2xl text-stone-600">{c.intro}</p>

      <div className="mt-6">
        {c.tool === "perdiem" && <PerDiemCalculator />}
        {c.tool === "mileage" && <MileageCalculator />}
        {c.tool === "mie" && <MieCalculator />}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {CALCS.filter((o) => o.slug !== c.slug).map((o) => (
          <Link key={o.slug} href={`/calculators/${o.slug}`} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-stone-600 hover:border-sky-300">{o.h1}</Link>
        ))}
        <Link href="/methodology" className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-stone-600 hover:border-sky-300">How it&apos;s calculated</Link>
      </div>
    </div>
  );
}
