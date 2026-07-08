"use client";

import { useState } from "react";

// Opens the Stripe Billing Portal for the signed-in Pro user.
export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setMsg(data.error ?? "Could not open billing.");
    } catch {
      setMsg("Could not open billing. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={open} disabled={loading}
        className="inline-flex h-10 items-center justify-center rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {msg && <p className="mt-2 text-xs text-clay">{msg}</p>}
    </div>
  );
}
