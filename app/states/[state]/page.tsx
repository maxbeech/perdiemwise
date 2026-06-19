import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { US_STATES, getState, locationsInState } from "@/lib/states";
import { STANDARD_LODGING, STANDARD_MIE, firstLastForMie, FISCAL_YEAR } from "@/lib/gsa";
import { Container, Eyebrow } from "@/components/ui";

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
    <Container className="py-12 sm:py-16">
      <nav className="text-sm text-muted">
        <Link href="/states" className="hover:text-accent">By state</Link>
      </nav>

      <Eyebrow className="mt-4">By state</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {s.name} per diem rates (FY{FISCAL_YEAR})
      </h1>

      {s.oconus ? (
        <p className="mt-5 max-w-2xl rounded-xl bg-clay/10 p-4 text-sm text-clay">
          {s.name} is outside the continental US (OCONUS). Its per diem rates are set by the Department of
          Defense, not the GSA CONUS table, so they aren&apos;t listed here. The standard CONUS rate does not apply.
        </p>
      ) : (
        <p className="mt-3 max-w-2xl text-ink-soft">
          {cities.length > 0
            ? `${s.name} has ${cities.length} ${cities.length === 1 ? "city" : "cities"} with their own GSA rate. Everywhere else in the state uses the standard rate.`
            : `${s.name} has no separately listed GSA cities — the whole state uses the standard CONUS rate.`}
        </p>
      )}

      {!s.oconus && (
        <div className="mt-5 max-w-2xl rounded-xl border border-line bg-paper-2/50 p-4 text-sm">
          <strong className="text-ink">Standard rate (everywhere not listed):</strong>{" "}
          <span className="tnum">{usd(STANDARD_LODGING)}</span> lodging + <span className="tnum">{usd(STANDARD_MIE)}</span> M&amp;IE per day (<span className="tnum">{usd(firstLastForMie(STANDARD_MIE))}</span> first/last day).
        </div>
      )}

      {cities.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2/50 text-left">
              <tr>
                <th className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">City / county</th>
                <th className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">Lodging</th>
                <th className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">M&amp;IE</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((l) => {
                const peak = Math.max(...l.lodging), low = Math.min(...l.lodging);
                return (
                  <tr key={l.slug} className="border-t border-line hover:bg-paper-2/40">
                    <td className="px-4 py-2.5">
                      <Link href={`/per-diem/${l.slug}`} className="font-medium text-accent hover:underline">{l.city}</Link>
                      {l.county ? <span className="text-muted"> · {l.county}</span> : null}
                    </td>
                    <td className="tnum px-4 py-2.5 text-ink-soft">{peak === low ? usd(peak) : `${usd(low)}–${usd(peak)}`}</td>
                    <td className="tnum px-4 py-2.5 text-ink-soft">{usd(l.mie)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-10 text-sm text-muted">
        <Link href="/calculators/per-diem-calculator" className="text-accent hover:underline">Calculate a trip →</Link>
      </p>
    </Container>
  );
}
