"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Client-side account link for the header. Kept client-only so every marketing
// and city page stays statically generated (no per-request auth read). Renders
// a stable placeholder until the session is known to avoid layout shift.
export default function AuthNav({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [state, setState] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setState(data.user ? "in" : "out"));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setState(session?.user ? "in" : "out"),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const href = state === "in" ? "/account" : "/login";
  const label = state === "in" ? "Account" : "Sign in";

  if (variant === "mobile") {
    return <Link href={href} className="block rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-paper-2">{label}</Link>;
  }
  return (
    <Link
      href={href}
      aria-hidden={state === "loading"}
      className={`text-sm text-ink-soft transition-colors hover:text-ink ${state === "loading" ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      {label}
    </Link>
  );
}
