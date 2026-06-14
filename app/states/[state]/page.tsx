import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { US_STATES, getState, locationsInState } from "@/lib/states";
import { STANDARD_LODGING, STANDARD_MIE, firstLastForMie, FISCAL_YEAR } from "@/lib/gsa";

export const dynamicParams = false;
export const revalidate = 604800;

export function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.slug }));
}

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const s = getState(state);
  if (!s) return {};
  return {
    title: `${s.name} Per Diem Rates (FY${FISCAL_YEAR})`,
    description: `GSA FY${FISCAL_YEAR} per diem rates for ${s.name}: listed cities with their lodging and M&IE rates, plus the standard rate for everywhere else.`,
    alternates: { canonical: `/states/${s.slug}` },
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const s = getState(state);
  if (!s) notFound();
  const cities = locationsInState(s.code);

  return (
    <div>
      <nav className="text-sm text-stone-500"><Link href="/states" className="hover:text-sky-700">By state</Link></nav>
      <h1 className="mt-2 text-3xl font-extrabold text-stone-900">{s.name} per diem rates (FY{FISCAL_YEAR})</h1>

      {s.oconus ? (
        <p className="mt-3 max-w-2xl rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          {s.name} is outside the continental US (OCONUS). Its per diem rates are set by the Department of
          Defense, not the GSA CONUS table, so they aren&apos;t listed here. The standard CONUS rate does not apply.
        </p>
      ) : (
        <p className="mt-2 max-w-2xl text-stone-600">
          {cities.length > 0
            ? `${s.name} has ${cities.length} ${cities.length === 1 ? "city" : "cities"} with their own GSA rate. Everywhere else in the state uses the standard rate.`
            : `${s.name} has no separately listed GSA cities — the whole state uses the standard CONUS rate.`}
        </p>
      )}

      {!s.oconus && (
        <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
          <strong className="text-stone-900">Standard rate (everywhere not listed):</strong> {usd(STANDARD_LODGING)} lodging + {usd(STANDARD_MIE)} M&amp;IE per day ({usd(firstLastForMie(STANDARD_MIE))} first/last day).
        </div>
      )}

      {cities.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-stone-500"><tr><th className="px-4 py-2 font-medium">City / county</th><th className="px-4 py-2 font-medium">Lodging</th><th className="px-4 py-2 font-medium">M&amp;IE</th></tr></thead>
            <tbody>
              {cities.map((l) => {
                const peak = Math.max(...l.lodging), low = Math.min(...l.lodging);
                return (
                  <tr key={l.slug} className="border-t border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-2"><Link href={`/per-diem/${l.slug}`} className="font-medium text-sky-700 hover:underline">{l.city}</Link>{l.county ? <span className="text-stone-400"> · {l.county}</span> : null}</td>
                    <td className="px-4 py-2">{peak === low ? usd(peak) : `${usd(low)}–${usd(peak)}`}</td>
                    <td className="px-4 py-2">{usd(l.mie)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-8 text-sm text-stone-500"><Link href="/calculators/per-diem-calculator" className="text-sky-700 hover:underline">Calculate a trip →</Link></p>
    </div>
  );
}
