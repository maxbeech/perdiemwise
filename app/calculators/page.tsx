import type { Metadata } from "next";
import Link from "next/link";
import { CALCS } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Per Diem & Mileage Calculators",
  description: "Free calculators for federal travel: GSA per diem trips, IRS mileage reimbursement, and the meals & incidentals (M&IE) breakdown.",
  alternates: { canonical: "/calculators" },
};

export default function CalculatorsIndex() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-stone-900">Calculators</h1>
      <p className="mt-2 max-w-2xl text-stone-600">Free, accurate tools built on the official GSA FY2026 per diem rates and the 2026 IRS mileage rates.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {CALCS.map((c) => (
          <Link key={c.slug} href={`/calculators/${c.slug}`} className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-sky-300 hover:shadow-sm">
            <h2 className="font-bold text-stone-900">{c.h1}</h2>
            <p className="mt-1 text-sm text-stone-600">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
