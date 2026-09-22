"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Client hook: current sign-in + Pro status, for gating Pro actions in the
// calculators. Reads the user's own profile row (RLS-scoped). Kept lightweight
// so it can drop into any client component without a provider.
export interface AccountClientState {
  loading: boolean;
  userId: string | null;
  isPro: boolean;
}

export function useAccountClient(): AccountClientState {
  const [state, setState] = useState<AccountClientState>({ loading: true, userId: null, isPro: false });

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      // Supabase's own promise can reject (not just resolve with `{ error }`)
      // on an internal auth-client fault. `load()` is fired without an
      // `await` below, so an uncaught rejection here becomes an unhandled
      // promise rejection reported from every page that uses this hook.
      // Treat that the same as "signed out" rather than crashing.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (!cancelled) setState({ loading: false, userId: null, isPro: false }); return; }
        const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle<{ plan: string }>();
        if (!cancelled) setState({ loading: false, userId: user.id, isPro: profile?.plan === "pro" });
      } catch {
        if (!cancelled) setState({ loading: false, userId: null, isPro: false });
      }
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  return state;
}
