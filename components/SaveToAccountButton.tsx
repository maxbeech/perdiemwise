"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccountClient } from "@/lib/use-account-client";
import { addCloudTrip, type NewCloudTrip } from "@/lib/trips-remote";

// Pro-gated "save this to your account (cloud)" control shared by both
// calculators. Free/signed-out users see a link to Pro; Pro users get a real
// one-click save that syncs the trip to every device.
export default function SaveToAccountButton({ buildTrip }: { buildTrip: () => NewCloudTrip | null }) {
  const { loading, isPro } = useAccountClient();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const ready = Boolean(buildTrip());

  if (loading) return <span className="text-xs text-muted">·</span>;

  if (!isPro) {
    return (
      <Link href="/pricing" className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-medium text-ink-soft transition hover:border-accent hover:text-accent">
        ☁ Save to account
        <span className="rounded bg-accent-tint px-1 text-[10px] font-semibold text-accent-dark">Pro</span>
      </Link>
    );
  }

  async function save() {
    const trip = buildTrip();
    if (!trip) return;
    setStatus("saving"); setMsg(null);
    try {
      await addCloudTrip(trip);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "Could not save.");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={save} disabled={!ready || status === "saving"}
        className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-medium text-ink transition hover:border-accent hover:text-accent disabled:opacity-40">
        {status === "saving" ? "Saving…" : status === "saved" ? "Synced ✓" : "☁ Save to account"}
      </button>
      {msg && <span className="text-xs text-clay">{msg}</span>}
    </span>
  );
}
