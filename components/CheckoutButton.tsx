"use client";

import { useState } from "react";

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setMsg(data.error ?? "Checkout isn't available yet — please check back soon.");
    } catch {
      setMsg("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={start} disabled={loading}
        className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60">
        {loading ? "Starting…" : "Get PerDiemWise Pro"}
      </button>
      {msg && <p className="mt-2 text-center text-xs text-stone-500">{msg}</p>}
    </div>
  );
}
