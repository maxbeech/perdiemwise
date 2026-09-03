import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// Server-side account helpers — the single source of truth for "who is signed
// in and are they Pro". Used by the account dashboard, the report route and the
// checkout/portal routes.

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  stripe_customer_id: string | null;
  plan: "free" | "pro" | "team";
  subscription_status: string | null;
  current_period_end: string | null;
}

export interface Account {
  user: User;
  profile: Profile | null;
  isPro: boolean;
  isTeam: boolean;
}

/** Returns the signed-in account (user + profile) or null when signed out. */
export async function getAccount(): Promise<Account | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, stripe_customer_id, plan, subscription_status, current_period_end")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return { user, profile: profile ?? null, isPro: profile?.plan === "pro" || profile?.plan === "team", isTeam: profile?.plan === "team" };
}
