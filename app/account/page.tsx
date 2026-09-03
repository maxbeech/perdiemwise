import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Container } from "@/components/ui";
import CheckoutPending from "@/components/CheckoutPending";
import ManageBillingButton from "@/components/ManageBillingButton";
import UpgradePanel from "@/components/UpgradePanel";
import { getAccount } from "@/lib/account";
import CloudTrips from "./CloudTrips";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your PerDiemWise plan, cloud-synced trips and expense-report exports.",
  robots: { index: false },
  alternates: { canonical: "/account" },
};

const PRO_BENEFITS = [
  "Cloud-synced trips on every device",
  "IRS/GSA-compliant expense-report PDF",
  "Mileage-log PDF for tax records",
  "CSV / spreadsheet export",
  "Batch multiple trips into one report",
  "Priority email support",
];

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const account = await getAccount();
  if (!account) redirect("/login?next=/account");
  const { checkout } = await searchParams;
  const { user, profile, isPro } = account;
  const renews = fmtDate(profile?.current_period_end ?? null);

  return (
    <Container className="py-14 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Your account</h1>
            <p className="mt-1 text-muted">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-clay hover:text-clay">Sign out</button>
          </form>
        </div>

        {checkout === "success" && isPro && (
          <p className="mt-6 rounded-xl bg-accent-tint px-4 py-3 text-sm text-accent-dark">🎉 Welcome to Pro! Your subscription is active — your trips now sync across devices and expense-report exports are unlocked below.</p>
        )}

        {/* Plan card */}
        <section className="mt-8 rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">Plan</h2>
              <Badge tone={isPro ? "accent" : "ink"}>{isPro ? "Pro" : "Free"}</Badge>
            </div>
            {isPro && <ManageBillingButton />}
          </div>

          {isPro ? (
            <p className="mt-3 text-sm text-muted">
              {profile?.subscription_status === "active" && renews ? <>Your Pro plan renews on <span className="font-medium text-ink">{renews}</span>.</> : null}
              {profile?.subscription_status && profile.subscription_status !== "active" ? <> Subscription status: <span className="font-medium text-ink">{profile.subscription_status}</span>.</> : null}
              {" "}Manage your card, invoices or cancellation anytime via billing.
            </p>
          ) : (
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted">Upgrade to unlock the tools professionals use at expense time:</p>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
                  {PRO_BENEFITS.map((b) => (
                    <li key={b} className="flex gap-2.5">
                      <svg className="mt-0.5 shrink-0 text-accent" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-line bg-paper-2/40 p-5">
                {checkout === "success" ? <CheckoutPending /> : <UpgradePanel nextPath="/account" />}
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-line bg-paper-2/40 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">For recurring team work</p><h2 className="mt-2 font-display text-xl font-semibold text-ink">Bookkeeper team workspace</h2><p className="mt-2 max-w-xl text-sm text-muted">Invite travellers and reviewers, then review their saved trip records in one ledger.</p></div><Link href="/team" className="rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent">Open workspace →</Link></div>
        </section>

        {/* Pro tools */}
        <section className="mt-8 rounded-3xl border border-line bg-surface p-6 sm:p-8">
          {isPro ? (
            <CloudTrips />
          ) : (
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-ink">Cloud-synced trips &amp; exports</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">Trips you save on this device stay in your browser on the free plan. Upgrade to Pro to sync them to every device and export IRS/GSA expense-report &amp; mileage-log PDFs.</p>
              <Link href="/calculators/per-diem-calculator" className="mt-4 inline-block text-sm text-accent hover:underline">Open the calculator →</Link>
            </div>
          )}
        </section>
      </div>
    </Container>
  );
}
