import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { getAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { buildReport, type PerDiemReportItem } from "@/lib/report";
import { FISCAL_YEAR_LABEL } from "@/lib/gsa";
import { IRS_MILEAGE_2026, SITE } from "@/lib/site";
import type { CloudTrip } from "@/lib/trips-remote";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Expense report",
  description: "Your IRS/GSA-compliant per diem and mileage expense report.",
  robots: { index: false },
  alternates: { canonical: "/account/report" },
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const DAY_LABEL: Record<string, string> = { first: "Travel day (75% M&IE)", full: "Full day", last: "Return day (75% M&IE)", single: "Same-day (75% M&IE)" };
const fmtDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function ReportPage() {
  const account = await getAccount();
  if (!account) redirect("/login?next=/account/report");
  if (!account.isPro) redirect("/account");

  const supabase = await createClient();
  const { data } = await supabase.from("trips").select("id, kind, name, total, data, created_at").order("created_at", { ascending: false });
  const report = buildReport((data ?? []) as CloudTrip[]);
  const generated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <Container className="py-10 print-sheet">
      <div className="mx-auto max-w-3xl">
        {/* Toolbar — hidden when printing */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/account" className="text-sm text-muted hover:text-ink">← Back to account</Link>
          <PrintButton />
        </div>

        <article className="rounded-2xl border border-line bg-white p-8 sm:p-10 print-card">
          {/* Letterhead */}
          <header className="flex items-start justify-between border-b border-line pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-accent text-[15px] font-semibold text-white">P</span>
                <span className="text-[15px] font-semibold text-ink">PerDiem<span className="text-accent">Wise</span></span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Travel Expense Report</h1>
            </div>
            <dl className="text-right text-xs text-muted">
              <div><dt className="inline">Prepared for </dt><dd className="inline font-medium text-ink">{account.user.email}</dd></div>
              <div className="mt-1"><dt className="inline">Generated </dt><dd className="inline text-ink">{generated}</dd></div>
              <div className="mt-1"><dt className="inline">Basis </dt><dd className="inline text-ink">GSA {FISCAL_YEAR_LABEL.split(" (")[0]} · IRS {IRS_MILEAGE_2026.taxYear}</dd></div>
            </dl>
          </header>

          {report.perDiem.length === 0 && report.mileage.length === 0 ? (
            <p className="mt-8 text-sm text-muted">No trips to report yet. Save trips in the calculator and import them on your <Link href="/account" className="text-accent underline">account</Link>.</p>
          ) : (
            <>
              {report.perDiem.length > 0 && (
                <section className="mt-8">
                  <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Per diem — lodging &amp; M&amp;IE</h2>
                  <div className="mt-3 space-y-6">
                    {report.perDiem.map((item) => <PerDiemBlock key={item.id} item={item} />)}
                  </div>
                </section>
              )}

              {report.mileage.length > 0 && (
                <section className="mt-10">
                  <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Mileage log</h2>
                  <table className="mt-3 w-full border-collapse text-sm">
                    <thead><tr className="border-y border-line text-left text-xs uppercase tracking-wide text-muted"><th className="py-2 font-medium">Trip</th><th className="font-medium">Category</th><th className="py-2 text-right font-medium">Miles</th><th className="text-right font-medium">Rate</th><th className="py-2 pl-3 text-right font-medium">Amount</th></tr></thead>
                    <tbody>
                      {report.mileage.map((m) => (
                        <tr key={m.id} className="border-b border-line">
                          <td className="py-2 text-ink">{m.name}</td>
                          <td className="capitalize text-muted">{m.category}</td>
                          <td className="tnum py-2 text-right text-ink">{m.miles.toLocaleString()}</td>
                          <td className="tnum text-right text-muted">{m.rate.toFixed(3)}</td>
                          <td className="tnum py-2 pl-3 text-right text-ink">{usd(m.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Grand total */}
              <section className="mt-10 border-t-2 border-ink pt-4">
                <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
                  {report.perDiemTotal > 0 && <Row label="Per diem subtotal" value={usd(report.perDiemTotal)} />}
                  {report.mileageTotal > 0 && <Row label="Mileage subtotal" value={usd(report.mileageTotal)} />}
                  <div className="flex items-baseline justify-between border-t border-line pt-2 text-base font-semibold text-ink">
                    <dt>Total reimbursement</dt><dd className="tnum">{usd(report.grandTotal)}</dd>
                  </div>
                </dl>
              </section>
            </>
          )}

          <footer className="mt-10 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
            Prepared with {SITE.name} using official GSA {FISCAL_YEAR_LABEL.split(" (")[0]} lodging &amp; M&amp;IE rates and the {IRS_MILEAGE_2026.effective} IRS standard mileage rates. M&amp;IE is paid at 75% on the first and last travel day (FTR §301-11.101). An independent tool — not affiliated with the GSA or IRS. Verify final amounts against your organisation&apos;s travel policy.
          </footer>
        </article>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-baseline justify-between text-muted"><dt>{label}</dt><dd className="tnum text-ink">{value}</dd></div>;
}

function PerDiemBlock({ item }: { item: PerDiemReportItem }) {
  const r = item.result;
  return (
    <div className="print-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium text-ink">{item.locationLabel}</h3>
        <span className="text-xs text-muted">{fmtDate(item.start)} → {fmtDate(item.end)} · {r.days} day{r.days === 1 ? "" : "s"}, {r.nights} night{r.nights === 1 ? "" : "s"}</span>
      </div>
      <table className="mt-2 w-full border-collapse text-sm">
        <thead><tr className="border-y border-line text-left text-xs uppercase tracking-wide text-muted"><th className="py-1.5 font-medium">Date</th><th className="font-medium">Day</th><th className="py-1.5 text-right font-medium">Lodging</th><th className="pl-3 text-right font-medium">M&amp;IE</th></tr></thead>
        <tbody>
          {r.lines.map((l) => (
            <tr key={l.date} className="border-b border-line/70">
              <td className="py-1.5 text-ink">{fmtDate(l.date)}</td>
              <td className="text-muted">{DAY_LABEL[l.type]}</td>
              <td className="tnum py-1.5 text-right text-ink">{l.lodging ? usd(l.lodging) : "—"}</td>
              <td className="tnum pl-3 text-right text-ink">{usd(l.mie)}</td>
            </tr>
          ))}
          <tr className="font-medium text-ink">
            <td className="py-1.5" colSpan={2}>Subtotal{r.mealsDeducted > 0 ? ` (−${usd(r.mealsDeducted)} provided meals)` : ""}</td>
            <td className="tnum py-1.5 text-right">{usd(r.lodgingTotal)}</td>
            <td className="tnum pl-3 text-right">{usd(r.mieTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
