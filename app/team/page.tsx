import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import TeamWorkspace from "@/components/TeamWorkspace";
import { getAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Team workspace", description: "Review travel and mileage records across a PerDiemWise team.", robots: { index: false } };

export default async function TeamPage() {
  const account = await getAccount();
  if (!account) redirect("/login?next=/team");
  return <Container className="py-14 sm:py-16"><div className="mx-auto max-w-5xl"><p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">For bookkeepers & finance teams</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">One ledger for every traveller.</h1><p className="mt-3 max-w-2xl text-lg text-muted">Invite the people who travel, let them save their real trip records, and review one combined ledger before you export or reimburse.</p><div className="mt-9"><TeamWorkspace /></div></div></Container>;
}
