import type { Metadata } from "next";
import Link from "next/link";
import { US_STATES, locationsInState } from "@/lib/states";

export const metadata: Metadata = {
  title: "Per Diem Rates by State (FY2026)",
  description: "GSA FY2026 per diem rates for all 50 states and DC. See each state's listed cities and the standard rate that applies everywhere else.",
  alternates: { canonical: "/states" },
};

export default function StatesIndex() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-stone-900">Per diem rates by state</h1>
      <p className="mt-2 max-w-2xl text-stone-600">Choose a state for its FY2026 GSA per diem cities and the standard rate that covers everywhere else.</p>
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {US_STATES.map((s) => {
          const n = locationsInState(s.code).length;
          return (
            <Link key={s.code} href={`/states/${s.slug}`} className="rounded-xl border border-stone-200 bg-white px-4 py-3 hover:border-sky-300 hover:shadow-sm">
              <div className="font-medium text-stone-900">{s.name}</div>
              <div className="text-xs text-stone-500">{s.oconus ? "OCONUS rates" : n > 0 ? `${n} listed cities` : "standard rate"}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
