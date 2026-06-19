"use client";

import { useSyncExternalStore } from "react";
import { subscribeTrips, getTripsSnapshot, getServerTripsSnapshot, saveTrip, removeTrip, type SavedTrip } from "@/lib/saved-trips";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export interface CurrentTrip {
  locationSlug: string | null;
  locationLabel: string;
  start: string;
  end: string;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  total: number;
}

export default function SavedTrips({ current, onRestore }: { current: CurrentTrip | null; onRestore: (t: SavedTrip) => void }) {
  const trips = useSyncExternalStore(subscribeTrips, getTripsSnapshot, getServerTripsSnapshot);

  function save() {
    if (!current) return;
    const label = current.locationLabel || "Standard rate";
    saveTrip({ ...current, name: `${label} · ${current.start}` });
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Saved trips</h3>
        <button type="button" onClick={save} disabled={!current}
          className="rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-medium text-ink transition hover:border-accent hover:text-accent disabled:opacity-40">
          + Save this trip
        </button>
      </div>
      {trips.length === 0 ? (
        <p className="mt-2 text-xs text-muted">Save a calculated trip and it&apos;ll stay here on this device — handy for recurring routes and expense reports.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {trips.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-paper-2/50 px-3 py-2 text-sm">
              <button type="button" onClick={() => onRestore(t)} className="min-w-0 flex-1 text-left">
                <span className="block truncate font-medium text-ink">{t.name}</span>
                <span className="tnum text-xs text-muted">{usd(t.total)} · {t.start} → {t.end}</span>
              </button>
              <button type="button" onClick={() => removeTrip(t.id)} aria-label={`Delete ${t.name}`}
                className="shrink-0 rounded-md p-1 text-muted hover:bg-paper-2 hover:text-clay">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
