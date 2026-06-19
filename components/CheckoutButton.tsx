"use client";

import { useState } from "react";

export default function CheckoutButton({ label = "Get PerDiemWise Pro", className = "" }: { label?: string; className?: string }) {
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
        className={`inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-60 ${className}`}>
        {loading ? "Starting…" : label}
      </button>
      {msg && <p className="mt-2 text-center text-xs text-muted">{msg}</p>}
    </div>
  );
}
