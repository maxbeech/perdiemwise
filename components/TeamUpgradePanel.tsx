"use client";

import { useState } from "react";
import { PRICING } from "@/lib/stripe";

export default function TeamUpgradePanel() {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function start() {
    setLoading(true); setMessage(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: "team", interval }) });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      if (data.needsAuth) { window.location.href = "/login?next=/team"; return; }
      setMessage(data.error ?? "Team checkout is not configured yet.");
    } catch { setMessage("Could not start team checkout."); } finally { setLoading(false); }
  }
  const price = interval === "annual" ? PRICING.teamAnnual : PRICING.teamMonthly;
  return <div><div className="flex rounded-full border border-line bg-paper-2/60 p-1 text-sm">{(["monthly", "annual"] as const).map((item) => <button key={item} type="button" onClick={() => setInterval(item)} className={`flex-1 rounded-full px-3 py-1.5 font-medium capitalize ${interval === item ? "bg-surface text-ink shadow-sm" : "text-muted"}`}>{item}{item === "annual" && <span className="ml-1 text-[11px] text-accent">−17%</span>}</button>)}</div><p className="mt-4 flex items-baseline gap-1"><span className="tnum text-4xl font-semibold text-paper">{price.label}</span><span className="text-paper/65">{price.per}</span></p><button type="button" onClick={start} disabled={loading} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-white hover:bg-accent-dark disabled:opacity-60">{loading ? "Starting…" : "Start team plan"}</button>{message && <p className="mt-2 text-center text-xs text-clay" role="alert">{message}</p>}<p className="mt-3 text-center text-xs text-muted">Requires a configured Stripe team price · cancel anytime</p></div>;
}
