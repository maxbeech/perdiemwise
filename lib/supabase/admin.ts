import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client — bypasses RLS. SERVER-ONLY. Used exclusively by
// the Stripe webhook and checkout route to write billing state (plan,
// stripe_customer_id, current_period_end) that users must not be able to set
// themselves. Never import this into a client component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
