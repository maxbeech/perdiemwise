import type { Metadata } from "next";
import CheckoutButton from "@/components/CheckoutButton";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro",
  description: "PerDiemWise is free for the per diem and mileage calculators. Pro adds IRS/GSA-compliant expense-report PDFs, multi-traveler trips, CSV export and historical rates.",
  alternates: { canonical: "/pricing" },
};

const FREE = ["GSA FY2026 per diem trip calculator", "2026 IRS mileage reimbursement calculator", "Meals & incidentals (M&IE) breakdown", "Per diem rates for every GSA city & state", "75% first-and-last-day rule applied automatically"];
const PRO = ["Everything in Free", "IRS/GSA-compliant expense-report & mileage-log PDF", "Multi-traveler and multi-trip batches", "CSV / spreadsheet export", "OCONUS & international (DoD/State Dept) rates", "Historical fiscal-year rates"];

export default function Pricing() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-stone-900">Simple pricing</h1>
      <p className="mt-2 text-stone-600">The calculators are free forever. Pro adds the export and compliance tools teams need.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold text-stone-900">Free</h2>
          <p className="mt-1 text-3xl font-extrabold text-stone-900">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">
            {FREE.map((f) => <li key={f} className="flex gap-2"><span className="text-sky-600">✓</span>{f}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-sky-500 bg-white p-6">
          <h2 className="text-lg font-bold text-stone-900">Pro</h2>
          <p className="mt-1 text-3xl font-extrabold text-stone-900">$9<span className="text-base font-medium text-stone-500">/mo</span></p>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">
            {PRO.map((f) => <li key={f} className="flex gap-2"><span className="text-sky-600">✓</span>{f}</li>)}
          </ul>
          <div className="mt-5"><CheckoutButton /></div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-stone-400">Built for accountants, government contractors and frequent business travellers. Prices in USD.</p>
    </div>
  );
}
