import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe → PerDiemWise source of truth for billing state. Verifies the raw-body
// signature, then mirrors the subscription onto profiles.plan. This is the ONLY
// path that can set a user to 'pro' (users have no write policy on that column).
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const sig = request.headers.get("stripe-signature");
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig ?? "", secret);
  } catch (e) {
    const message = e instanceof Error ? e.message : "bad signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await syncSubscription(stripe, sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(stripe, event.data.object as Stripe.Subscription);
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "handler error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

// Writes the subscription's plan/status/period onto the matching profile,
// located by user_id metadata (preferred) or Stripe customer id.
async function syncSubscription(stripe: Stripe, sub: Stripe.Subscription) {
  const active = sub.status === "active" || sub.status === "trialing";
  const periodEnd = subscriptionPeriodEnd(sub);
  const admin = createAdminClient();
  const requestedPlan = sub.metadata?.plan === "team" ? "team" : "pro";
  const patch = {
    plan: active ? requestedPlan : "free",
    subscription_status: sub.status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const userId = sub.metadata?.user_id;
  if (userId) {
    const { error } = await admin.from("profiles").update(patch).eq("id", userId);
    if (!error) return;
  }
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  await admin.from("profiles").update(patch).eq("stripe_customer_id", customerId);
}

// current_period_end lives on the subscription in older API versions and on the
// items in newer ones — read whichever is present.
function subscriptionPeriodEnd(sub: Stripe.Subscription): number | undefined {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (top) return top;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
  return item?.current_period_end;
}
