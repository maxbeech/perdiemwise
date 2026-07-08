"use client";

import { useState } from "react";
import { PRICING } from "@/lib/stripe";

type Interval = "monthly" | "annual";

// Reusable Pro checkout control: monthly/annual toggle + a button that starts
// Stripe Checkout. If the user isn't signed in, the checkout route returns
// needsAuth and we bounce them through /login and back. Used on /pricing and
// /account.
export default function UpgradePanel({ nextPath = "/pricing" }: { nextPath?: string }) {
  const [interval, setInterval] = useState<Interval>("monthly");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      if (data.needsAuth) { window.location.href = `/login?next=${encodeURIComponent(nextPath)}`; return; }
      setMsg(data.error ?? "Checkout isn't available yet — please check back soon.");
    } catch {
      setMsg("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const price = PRICING[interval];
  return (
    <div>
      <div className="flex rounded-full border border-line bg-paper-2/60 p-1 text-sm">
        {(["monthly", "annual"] as Interval[]).map((i) => (
          <button
            key={i} type="button" onClick={() => setInterval(i)}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium capitalize transition ${interval === i ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
          >
            {i}{i === "annual" && <span className="ml-1 text-[11px] text-accent">−17%</span>}
          </button>
        ))}
      </div>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="tnum text-4xl font-semibold text-ink">{price.label}</span>
        <span className="text-muted">{price.per}</span>
      </p>
      {interval === "annual" && <p className="mt-1 text-xs text-accent-dark">{PRICING.annual.note} — billed yearly</p>}
      <button
        onClick={start} disabled={loading}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {loading ? "Starting…" : "Get PerDiemWise Pro"}
      </button>
      {msg && <p className="mt-2 text-center text-xs text-clay">{msg}</p>}
      <p className="mt-3 text-center text-xs text-muted">Cancel anytime · secure checkout by Stripe</p>
    </div>
  );
}
