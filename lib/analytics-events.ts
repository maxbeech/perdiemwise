"use client";

import { useEffect, useRef } from "react";
import { track } from "./openhelm-analytics";
import type { AnalyticsEventMap, AnalyticsEventName, CalculatorId, PaidPlanId } from "./analytics-contract";
import { PRICING } from "./stripe";

/** Typed wrapper over `track`: only the events in the contract, with their params. */
export function trackEvent<N extends AnalyticsEventName>(name: N, params: AnalyticsEventMap[N]): void {
  track(name, params);
}

const SETTLE_MS = 1200;

/**
 * Report a calculator that produced a result (`signature` set) or rejected its
 * inputs (`failed`). Waits for the inputs to settle so typing a mileage figure
 * sends one event, and never repeats the same result.
 */
export function useTrackCalculation(calculator: CalculatorId, signature: string | null, failed: boolean): void {
  const lastSent = useRef<string | null>(null);
  useEffect(() => {
    const key = failed ? "failed" : signature;
    if (!key || lastSent.current === key) return;
    const timer = setTimeout(() => {
      lastSent.current = key;
      trackEvent(failed ? "calculation_failed" : "calculation_completed", { calculator });
    }, SETTLE_MS);
    return () => clearTimeout(timer);
  }, [calculator, signature, failed]);
}

/** Send the right event for a /api/checkout response. */
export function trackCheckoutResponse(
  plan: PaidPlanId,
  interval: "monthly" | "annual",
  res: { status: number },
  data: { url?: string; needsAuth?: boolean },
): void {
  if (data.url) {
    const price = plan === "team" ? (interval === "annual" ? PRICING.teamAnnual : PRICING.teamMonthly) : PRICING[interval];
    trackEvent("begin_checkout", { plan, interval, currency: "USD", value: price.amount });
  } else if (data.needsAuth) {
    trackEvent("checkout_sign_in_required", { plan });
  } else {
    trackEvent("checkout_failed", { plan, reason: `http_${res.status}` });
  }
}
