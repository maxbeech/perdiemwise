import Stripe from "stripe";

// Server-only Stripe client + the plan/price registry. The route handlers stay
// thin by importing from here. Keys are read lazily so importing this module
// never throws when Stripe isn't configured (the free product must still build).

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // Omit apiVersion so the SDK's pinned version is used (avoids a literal-type
  // mismatch and keeps request/response shapes matched to the installed types).
  return new Stripe(key);
}

export type BillingInterval = "monthly" | "annual";
export type BillingProduct = "pro" | "team";

/** Resolve the configured Stripe price id for a billing interval. */
export function priceFor(interval: BillingInterval): string | undefined {
  return interval === "annual"
    ? process.env.STRIPE_PRICE_ID_ANNUAL
    : process.env.STRIPE_PRICE_ID_MONTHLY;
}

export function teamPriceFor(interval: BillingInterval): string | undefined {
  return interval === "annual" ? process.env.STRIPE_PRICE_ID_TEAM_ANNUAL : process.env.STRIPE_PRICE_ID_TEAM_MONTHLY;
}

/** Whether checkout can run at all (keys + at least the monthly price present). */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID_MONTHLY);
}

// Public, display-only pricing. Kept here so the pricing page and checkout agree
// on the numbers even though the charge amount is authoritative in Stripe.
export const PRICING = {
  monthly: { amount: 9, label: "$9", per: "/ month" },
  annual: { amount: 90, label: "$90", per: "/ year", note: "2 months free" },
  teamMonthly: { amount: 49, label: "$49", per: "/ month" },
  teamAnnual: { amount: 490, label: "$490", per: "/ year", note: "2 months free" },
} as const;
