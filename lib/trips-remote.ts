import { createClient } from "@/lib/supabase/client";
import type { SavedTrip } from "@/lib/saved-trips";

// Cloud-synced trips (Pro). Thin CRUD over the `trips` table using the browser
// Supabase client — RLS scopes every row to the signed-in user, and the
// insert/update policies additionally require an active Pro plan.

export type TripKind = "perdiem" | "mileage";

export interface CloudTrip {
  id: string;
  kind: TripKind;
  name: string;
  total: number;
  data: Record<string, unknown>;
  created_at: string;
}

export interface NewCloudTrip {
  kind: TripKind;
  name: string;
  total: number;
  data: Record<string, unknown>;
}

export async function listCloudTrips(): Promise<CloudTrip[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("id, kind, name, total, data, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CloudTrip[];
}

/** Insert any trip into the cloud. Returns the created row's id. */
export async function addCloudTrip(trip: NewCloudTrip): Promise<string> {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { data, error } = await supabase
    .from("trips")
    .insert({ ...trip, user_id: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Convenience wrapper for the per-diem shape used by the device-import flow. */
export async function addCloudPerDiemTrip(trip: SavedTrip): Promise<string> {
  return addCloudTrip({
    kind: "perdiem",
    name: trip.name,
    total: trip.total,
    data: {
      locationSlug: trip.locationSlug,
      locationLabel: trip.locationLabel,
      start: trip.start,
      end: trip.end,
      meals: trip.meals,
    },
  });
}

export async function deleteCloudTrip(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
