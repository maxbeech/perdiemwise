import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { Badge, Container, Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro",
  description: "PerDiemWise is free for the per diem and mileage calculators. Pro adds IRS/GSA-compliant expense-report PDFs, cloud-synced trips, team rates, CSV export and OCONUS rates.",
  alternates: { canonical: "/pricing" },
};

const FREE = ["GSA FY2026 per diem trip calculator", "2026 IRS mileage reimbursement calculator", "Provided-meal deductions & the 75% rule", "Per diem rates for every GSA city & state", "Save & reuse trips on this device", "Copy-ready itemised breakdowns"];
const PRO = ["Everything in Free", "Cloud-synced trips across your devices", "IRS/GSA-compliant expense-report & mileage-log PDF", "Multi-traveler & multi-trip batches", "CSV / spreadsheet export", "OCONUS & international (DoD/State Dept) rates", "Historical fiscal-year rates"];

function Check() {
  return <svg className="mt-0.5 shrink-0 text-accent" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function Pricing() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Free to calculate. Pro to operate.</h1>
        <p className="mt-4 text-lg text-muted">The calculators are free forever. Pro adds the export, sync and compliance tools that teams and contractors need at expense time.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="flex flex-col rounded-3xl border border-line bg-surface p-8">
          <h2 className="font-display text-2xl font-semibold text-ink">Free</h2>
          <p className="mt-1 text-sm text-muted">For individual travellers</p>
          <p className="mt-5 flex items-baseline gap-1"><span className="tnum text-4xl font-semibold text-ink">$0</span><span className="text-muted">/ forever</span></p>
          <ul className="mt-7 flex-1 space-y-3 text-sm text-ink-soft">
            {FREE.map((f) => <li key={f} className="flex gap-2.5"><Check />{f}</li>)}
          </ul>
          <Link href="/calculators/per-diem-calculator" className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-line-strong px-5 text-[15px] font-medium text-ink transition hover:border-accent hover:text-accent">Start calculating</Link>
        </div>

        {/* Pro */}
        <div className="relative flex flex-col rounded-3xl border-2 border-accent bg-surface p-8 shadow-[0_24px_60px_-30px_rgba(14,107,70,0.45)]">
          <div className="absolute -top-3 left-8"><Badge>Most popular</Badge></div>
          <h2 className="font-display text-2xl font-semibold text-ink">Pro</h2>
          <p className="mt-1 text-sm text-muted">For accountants, contractors & teams</p>
          <p className="mt-5 flex items-baseline gap-1"><span className="tnum text-4xl font-semibold text-ink">$9</span><span className="text-muted">/ month</span></p>
          <ul className="mt-7 flex-1 space-y-3 text-sm text-ink-soft">
            {PRO.map((f) => <li key={f} className="flex gap-2.5"><Check />{f}</li>)}
          </ul>
          <div className="mt-8"><CheckoutButton label="Get PerDiemWise Pro" /></div>
          <p className="mt-3 text-center text-xs text-muted">Cancel anytime · billed via Stripe</p>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-sm text-muted">
        Built for government contractors, accountants and frequent business travellers. Questions about team plans? <Link href={`mailto:${SITE.email}`} className="text-accent hover:underline">{SITE.email}</Link>
      </p>
    </Container>
  );
}
