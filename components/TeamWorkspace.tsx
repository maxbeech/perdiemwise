"use client";

import { useEffect, useState } from "react";

type Team = { id: string; name: string; owner_id: string; created_at: string };
type TeamTrip = { id: string; user_id: string; kind: string; name: string; total: number; data: Record<string, unknown>; created_at: string };
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function TeamWorkspace() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selected, setSelected] = useState<Team | null>(null);
  const [trips, setTrips] = useState<TeamTrip[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/team").then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load teams.");
      if (!active) return;
      const next = (data.teams ?? []).map((row: { teams: Team }) => row.teams).filter(Boolean);
      setTeams(next);
      if (next[0]) setSelected((current) => current ?? next[0]);
    }).catch((e) => { if (active) setMessage(e instanceof Error ? e.message : "Could not load teams."); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!selected) return;
    fetch(`/api/team/${selected.id}/trips`).then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "Could not load team trips."); setTrips(data.trips ?? []); }).catch((e) => setMessage(e instanceof Error ? e.message : "Could not load team trips."));
  }, [selected]);

  async function createTeam() {
    setMessage(null);
    const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error ?? "Could not create team.");
    setName(""); setTeams((current) => [...current, data.team]); setSelected(data.team); setMessage("Workspace created.");
  }
  async function invite() {
    if (!selected) return;
    setMessage(null); setInviteUrl(null);
    const res = await fetch("/api/team/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId: selected.id, email }) });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error ?? "Could not create invitation.");
    setInviteUrl(data.inviteUrl); setEmail(""); setMessage("Invitation created. Copy the link below and send it to the teammate.");
  }
  const total = trips.reduce((sum, t) => sum + (Number(t.total) || 0), 0);

  return <div className="space-y-5">
    {message && <p className="rounded-xl bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="status">{message}</p>}
    <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-semibold text-ink">Workspaces</h2>
        {teams.length > 0 && <div className="mt-4 space-y-2">{teams.map((team) => <button key={team.id} type="button" onClick={() => setSelected(team)} className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${selected?.id === team.id ? "border-accent bg-accent-tint text-accent-dark" : "border-line text-ink-soft"}`}>{team.name}</button>)}</div>}
        <div className="mt-5 border-t border-line pt-4"><label htmlFor="team-name" className="text-sm font-medium text-ink-soft">Create a workspace</label><div className="mt-2 flex gap-2"><input id="team-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme travel desk" className="min-w-0 flex-1 rounded-xl border border-line-strong px-3 py-2 text-sm" /><button type="button" onClick={createTeam} disabled={!name.trim()} className="rounded-xl bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-40">Create</button></div></div>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Team ledger</p><h2 className="mt-1 font-display text-xl font-semibold text-ink">{selected?.name ?? "Choose a workspace"}</h2></div><div className="text-right"><p className="tnum text-2xl font-semibold text-accent-dark">{usd(total)}</p><p className="text-xs text-muted">reported trip totals</p></div></div>
        <div className="mt-5 border-t border-line pt-4"><label htmlFor="invite-email" className="text-sm font-medium text-ink-soft">Invite a bookkeeper, traveller or reviewer</label><div className="mt-2 flex gap-2"><input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="min-w-0 flex-1 rounded-xl border border-line-strong px-3 py-2 text-sm" /><button type="button" onClick={invite} disabled={!selected || !email.trim()} className="rounded-xl border border-line-strong px-3 py-2 text-sm font-medium text-ink disabled:opacity-40">Create invite</button></div>{inviteUrl && <textarea readOnly value={inviteUrl} rows={2} onFocus={(e) => e.currentTarget.select()} className="mt-3 w-full rounded-xl border border-line bg-paper-2 p-2 text-xs text-ink-soft" aria-label="Invitation link" />}</div>
        {trips.length === 0 ? <p className="mt-5 text-sm text-muted">No member trips are available yet. Members can save a trip to their Pro account from any calculator.</p> : <div className="mt-5 overflow-x-auto rounded-xl border border-line"><table className="w-full text-left text-sm"><thead className="bg-paper-2/50 text-xs uppercase tracking-wide text-muted"><tr><th className="px-3 py-2">Trip</th><th className="px-3 py-2">Type</th><th className="px-3 py-2 text-right">Total</th></tr></thead><tbody>{trips.map((trip) => <tr key={trip.id} className="border-t border-line"><td className="px-3 py-2 text-ink">{trip.name}</td><td className="px-3 py-2 text-muted">{trip.kind}</td><td className="tnum px-3 py-2 text-right text-ink">{usd(Number(trip.total) || 0)}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </div>;
}
