"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTripsSnapshot } from "@/lib/saved-trips";
import { listCloudTrips, addCloudPerDiemTrip, deleteCloudTrip, type CloudTrip } from "@/lib/trips-remote";
import { toCsv, downloadCsv } from "@/lib/csv";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

// Pro dashboard for cloud-synced trips: lists them, imports trips saved on this
// device, deletes, and exports CSV. The expense-report PDF lives at
// /account/report and reads the same rows.
export default function CloudTrips() {
  const [trips, setTrips] = useState<CloudTrip[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function refresh() {
    try { setTrips(await listCloudTrips()); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load trips."); }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await listCloudTrips();
        if (active) setTrips(rows);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Could not load trips.");
      }
    })();
    return () => { active = false; };
  }, []);

  async function importDevice() {
    setBusy(true); setError(null); setNote(null);
    try {
      const device = getTripsSnapshot();
      const existing = new Set((trips ?? []).map((t) => t.name));
      const toAdd = device.filter((d) => !existing.has(d.name));
      for (const d of toAdd) await addCloudPerDiemTrip(d);
      await refresh();
      setNote(toAdd.length ? `Imported ${toAdd.length} trip${toAdd.length === 1 ? "" : "s"} from this device.` : "No new device trips to import.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    setError(null);
    try { await deleteCloudTrip(id); setTrips((t) => (t ?? []).filter((x) => x.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); }
  }

  function exportCsv() {
    const rows = (trips ?? []).map((t) => {
      const d = t.data as { locationLabel?: string; start?: string; end?: string };
      return [t.name, d.locationLabel ?? "", d.start ?? "", d.end ?? "", t.total.toFixed(2)];
    });
    downloadCsv("perdiemwise-trips.csv", toCsv(["Trip", "Destination", "Depart", "Return", "Total (USD)"], rows));
  }

  const reportYear = new Date().getUTCFullYear();
  const yearTrips = (trips ?? []).filter((t) => String((t.data as { start?: string }).start ?? t.created_at).startsWith(String(reportYear)));
  const yearTotal = yearTrips.reduce((sum, t) => sum + (Number(t.total) || 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-ink">Cloud-synced trips</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={importDevice} disabled={busy} className="rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-sm font-medium text-ink transition hover:border-accent hover:text-accent disabled:opacity-50">{busy ? "Importing…" : "Import device trips"}</button>
          <button onClick={exportCsv} disabled={!trips?.length} className="rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-sm font-medium text-ink transition hover:border-accent hover:text-accent disabled:opacity-40">Export CSV</button>
          <Link href="/account/report" className={`rounded-full px-3.5 py-1.5 text-sm font-medium text-white transition ${trips?.length ? "bg-accent hover:bg-accent-dark" : "pointer-events-none bg-accent/40"}`}>Build expense report →</Link>
        </div>
      </div>

      {note && <p className="mt-3 text-sm text-accent-dark">{note}</p>}
      {error && <p className="mt-3 rounded-xl bg-clay/10 px-3 py-2 text-sm text-clay" role="alert">{error}</p>}

      {trips && <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3"><div className="bg-surface p-3.5"><p className="text-[11px] uppercase tracking-wide text-muted">{reportYear} running total</p><p className="tnum mt-1 text-xl font-semibold text-accent-dark">{usd(yearTotal)}</p></div><div className="bg-surface p-3.5"><p className="text-[11px] uppercase tracking-wide text-muted">{reportYear} saved trips</p><p className="tnum mt-1 text-xl font-semibold text-ink">{yearTrips.length}</p></div><div className="col-span-2 bg-surface p-3.5 sm:col-span-1"><p className="text-[11px] uppercase tracking-wide text-muted">Ongoing workflow</p><p className="mt-1 text-sm text-ink-soft">Save as you travel, export when you report.</p></div></div>}

      {trips === null ? (
        <p className="mt-4 text-sm text-muted">Loading your trips…</p>
      ) : trips.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line-strong bg-paper-2/40 px-5 py-8 text-center">
          <p className="text-sm text-muted">No cloud trips yet. Save trips in the <Link href="/calculators/per-diem-calculator" className="text-accent hover:underline">calculator</Link>, then <button onClick={importDevice} className="text-accent hover:underline">import them here</button> to sync across every device.</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {trips.map((t) => {
            const d = t.data as { locationLabel?: string; start?: string; end?: string };
            return (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{t.name}</p>
                  <p className="tnum text-xs text-muted">{d.locationLabel ?? "Standard rate"} · {d.start} → {d.end}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="tnum text-sm font-semibold text-accent-dark">{usd(t.total)}</span>
                  <button onClick={() => remove(t.id)} aria-label={`Delete ${t.name}`} className="rounded-md p-1 text-muted transition hover:bg-paper-2 hover:text-clay">✕</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
