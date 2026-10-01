"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-events";

// Sends purchase_confirmation_failed when the server could not confirm a
// payment on the return from Stripe.
export default function TrackFailure({ reason }: { reason: "payment_unverified" | "plan_not_active" }) {
  useEffect(() => { trackEvent("purchase_confirmation_failed", { reason }); }, [reason]);
  return null;
}
