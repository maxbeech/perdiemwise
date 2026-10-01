"use client";

import { useEffect, useRef } from "react";
import { identify } from "@/lib/openhelm-analytics";
import { trackEvent } from "@/lib/analytics-events";
import { AUTH_EVENT_PARAM } from "@/lib/analytics-contract";

// Sets the OpenHelm user properties once the visitor is known, then sends the
// events a page load can only learn about from its URL: the sign-in that just
// completed (the auth callback adds `oh_auth`), a dead sign-in link, a
// cancelled checkout. Identity goes first so those events carry it. Renders
// nothing, and only calls the server when a Supabase session cookie exists, so
// anonymous visitors cost nothing.
export default function AnalyticsSession() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const url = new URL(window.location.href);
    const authEvent = url.searchParams.get(AUTH_EVENT_PARAM);
    const hasSession = document.cookie.includes("-auth-token");

    async function run() {
      if (hasSession) {
        try {
          const res = await fetch("/api/analytics/identity", { cache: "no-store" });
          const who = (await res.json()) as { userRef: string | null; plan?: "free" | "paid" };
          if (who.userRef && who.plan) identify({ userRef: who.userRef, plan: who.plan });
        } catch {
          // Identity is best effort: events still send, just without the user properties.
        }
      }
      if (authEvent === "sign_up" || authEvent === "login") {
        trackEvent(authEvent, { method: "email_link" });
        url.searchParams.delete(AUTH_EVENT_PARAM);
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
      if (url.pathname === "/login" && url.searchParams.get("error") === "link") {
        trackEvent("login_failed", { reason: "link_invalid" });
      }
      if (url.pathname === "/pricing" && url.searchParams.get("checkout") === "cancel") {
        trackEvent("checkout_cancelled", {});
      }
    }
    void run();
  }, []);

  return null;
}
