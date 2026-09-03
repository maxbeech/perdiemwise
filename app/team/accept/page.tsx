"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function AcceptTeamInvite() {
  return <Suspense fallback={<main className="mx-auto max-w-xl px-5 py-20"><p className="text-sm text-muted">Loading invitation…</p></main>}><AcceptTeamInviteForm /></Suspense>;
}

function AcceptTeamInviteForm() {
  const params = useSearchParams();
  const [status, setStatus] = useState("Ready to accept this invitation.");
  async function accept() {
    setStatus("Accepting invitation…");
    const res = await fetch("/api/team/invite/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.get("token") }) });
    const data = await res.json();
    setStatus(res.ok ? "Invitation accepted. Open your team workspace." : data.error ?? "Could not accept invitation.");
  }
  return <main className="mx-auto max-w-xl px-5 py-20"><p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Team invitation</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">Join a PerDiemWise workspace</h1><p className="mt-4 text-muted">{status}</p><button type="button" onClick={accept} className="mt-7 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dark">Accept invitation</button></main>;
}
