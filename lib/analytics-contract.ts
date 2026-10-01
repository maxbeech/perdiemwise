import { userRefFor, type AnalyticsPlan } from "./openhelm-analytics-mp";

// The OpenHelm journey contract for PerDiemWise, kept free of React and Next so
// it can be unit-tested and used from both routes and components. Event names
// follow GA4's recommended names where one exists.

/** Every custom event the product sends, with the params each one carries. No
 *  personal data: never an email, a raw user id, a city or a trip total. */
export interface AnalyticsEventMap {
  sign_up: { method: "email_link" };
  login: { method: "email_link" };
  login_link_requested: Record<string, never>;
  login_failed: { reason: "rate_limited" | "otp_request" | "link_invalid" };
  calculation_completed: { calculator: CalculatorId };
  calculation_failed: { calculator: CalculatorId };
  trip_saved: { kind: string };
  trip_save_failed: { kind: string };
  begin_checkout: { plan: PaidPlanId; interval: string; currency: "USD"; value: number };
  checkout_sign_in_required: { plan: PaidPlanId };
  checkout_failed: { plan: PaidPlanId; reason: string };
  checkout_cancelled: Record<string, never>;
  purchase: { transaction_id: string; plan: PaidPlanId; currency: string; value: number };
  purchase_confirmation_failed: { reason: "payment_unverified" | "plan_not_active" };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
export type CalculatorId = "per_diem" | "mileage" | "truck_driver";
export type PaidPlanId = "pro" | "team";

/** Query param the auth callback adds so the next page can send sign_up or login. */
export const AUTH_EVENT_PARAM = "oh_auth";
export type AuthEvent = "sign_up" | "login";

/** First 16 hex chars of SHA-256 of the Supabase user id. Compute on the server. */
export const analyticsUserRef = (userId: string): Promise<string> => userRefFor(userId);

/**
 * `oh_plan` for a signed-in user. "paid" means the profile currently holds an
 * active Pro or Team subscription (the Stripe webhook mirrors that onto
 * profiles.plan and drops it to free when the subscription ends).
 */
export function analyticsPlan(profilePlan: string | null | undefined): AnalyticsPlan {
  return profilePlan === "pro" || profilePlan === "team" ? "paid" : "free";
}

/**
 * Magic links sign people up and in with one flow. A user whose email was
 * confirmed by this very sign-in is new; anyone else is returning.
 */
export function authEventFor(user: { email_confirmed_at?: string | null; last_sign_in_at?: string | null }): AuthEvent {
  const confirmed = Date.parse(user.email_confirmed_at ?? "");
  const lastSignIn = Date.parse(user.last_sign_in_at ?? "");
  if (!Number.isFinite(confirmed) || !Number.isFinite(lastSignIn)) return "login";
  return Math.abs(lastSignIn - confirmed) < 10_000 ? "sign_up" : "login";
}

/** Add the auth event marker to a same-site path, keeping any query it has. */
export function withAuthEvent(path: string, event: AuthEvent): string {
  return `${path}${path.includes("?") ? "&" : "?"}${AUTH_EVENT_PARAM}=${event}`;
}

/** A Stripe checkout session reduced to what `purchase` needs, or null when it
 *  was not a paid session for this user. */
export function purchaseFromSession(
  session: { id: string; payment_status?: string; client_reference_id?: string | null; amount_total?: number | null; currency?: string | null; metadata?: Record<string, string> | null },
  userId: string,
  plan: PaidPlanId,
): AnalyticsEventMap["purchase"] | null {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return null;
  if (session.client_reference_id !== userId) return null;
  if (typeof session.amount_total !== "number") return null;
  return {
    transaction_id: session.id,
    plan,
    currency: (session.currency ?? "usd").toUpperCase(),
    value: session.amount_total / 100,
  };
}
