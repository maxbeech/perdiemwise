import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, priceFor, stripeConfigured, type BillingInterval } from "@/lib/stripe";

// Create a fresh Stripe customer for this user and persist its id.
async function createCustomer(stripe: Stripe, userId: string, email: string | null | undefined): Promise<string> {
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { user_id: userId },
  });
  await createAdminClient()
    .from("profiles")
    .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return customer.id;
}

// Stripe throws this when a stored customer id no longer resolves — e.g. the id
// was created in a different mode (test vs live) or the customer was deleted.
function isMissingCustomer(e: unknown): boolean {
  const err = e as { code?: string; param?: string };
  return err?.code === "resource_missing" && err?.param === "customer";
}

// Creates a Stripe Checkout session for PerDiemWise Pro for the signed-in user.
// Requires an account (so the subscription is tied to a user the webhook can
// upgrade). Degrades gracefully to 503 before Stripe is configured.
export async function POST(request: Request) {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json(
      { error: "Please sign in to start your Pro subscription.", needsAuth: true },
      { status: 401 },
    );
  }

  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "PerDiemWise Pro is launching shortly. Email hello@perdiemwise.com for early access." },
      { status: 503 },
    );
  }

  const stripe = getStripe()!;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const { interval = "monthly" } = (await request.json().catch(() => ({}))) as { interval?: BillingInterval };
  const price = priceFor(interval);
  if (!price) return NextResponse.json({ error: "That plan isn't available." }, { status: 400 });

  const openSession = (customer: string) =>
    stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price, quantity: 1 }],
      client_reference_id: account.user.id,
      subscription_data: { metadata: { user_id: account.user.id } },
      allow_promotion_codes: true,
      success_url: `${base}/account?checkout=success`,
      cancel_url: `${base}/pricing?checkout=cancel`,
    });

  try {
    // Reuse the stored customer if we have one, else create + persist it.
    let customerId = account.profile?.stripe_customer_id
      ?? (await createCustomer(stripe, account.user.id, account.user.email));
    try {
      const session = await openSession(customerId);
      return NextResponse.json({ url: session.url });
    } catch (e) {
      // Stored id is stale (mode switch / deleted customer) — mint a new one once.
      if (!isMissingCustomer(e)) throw e;
      customerId = await createCustomer(stripe, account.user.id, account.user.email);
      const session = await openSession(customerId);
      return NextResponse.json({ url: session.url });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not reach Stripe.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
