"use client";

import { useEffect } from "react";
import { identify } from "@/lib/openhelm-analytics";
import { trackEvent } from "@/lib/analytics-events";
import type { AnalyticsEventMap } from "@/lib/analytics-contract";

// Rendered on /account after Stripe sends the customer back with a paid
// session the server has checked. Sends `purchase` once per session (a reload
// must not count twice) and moves the user to the paid plan right away rather
// than waiting for the webhook to catch up.
export default function PurchaseTracker({ purchase, userRef }: { purchase: AnalyticsEventMap["purchase"]; userRef: string }) {
  useEffect(() => {
    const key = `oh_purchase_${purchase.transaction_id}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: accept a possible repeat over losing the purchase.
    }
    identify({ userRef, plan: "paid" });
    trackEvent("purchase", purchase);
  }, [purchase, userRef]);
  return null;
}
