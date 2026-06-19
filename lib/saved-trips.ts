// Saved trips — real, working persistence in the browser (localStorage). No
// backend required; this is the free tier's "save your trips". Cloud sync across
// devices + team sharing is the documented Pro upgrade (needs Supabase + Stripe).
//
// Exposed as an external store (subscribe + getSnapshot) so React components can
// read it via useSyncExternalStore — SSR-safe and without setState-in-effect.

export interface SavedTrip {
  id: string;
  name: string;
  locationSlug: string | null;
  locationLabel: string;
  start: string;
  end: string;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  total: number;
  savedAt: string; // ISO
}

const KEY = "perdiemwise.trips.v1";
const MAX = 25;
const SERVER_SNAPSHOT: SavedTrip[] = [];

let snapshot: SavedTrip[] = SERVER_SNAPSHOT;
let loaded = false;
const listeners = new Set<() => void>();

function readStore(): SavedTrip[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedTrip[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function commit(next: SavedTrip[]) {
  snapshot = next;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota / private mode */ }
  }
  listeners.forEach((l) => l());
}

function onStorage() { snapshot = readStore(); listeners.forEach((l) => l()); }

export function subscribeTrips(cb: () => void): () => void {
  listeners.add(cb);
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined" && listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** Stable snapshot for useSyncExternalStore — same reference until trips change. */
export function getTripsSnapshot(): SavedTrip[] {
  if (!loaded && typeof window !== "undefined") { snapshot = readStore(); loaded = true; }
  return snapshot;
}

export function getServerTripsSnapshot(): SavedTrip[] {
  return SERVER_SNAPSHOT;
}

export function saveTrip(trip: Omit<SavedTrip, "id" | "savedAt">): void {
  const id = `${Date.now().toString(36)}-${(getTripsSnapshot().length + 1).toString(36)}`;
  const full: SavedTrip = { ...trip, id, savedAt: new Date().toISOString() };
  commit([full, ...getTripsSnapshot()].slice(0, MAX));
}

export function removeTrip(id: string): void {
  commit(getTripsSnapshot().filter((t) => t.id !== id));
}
