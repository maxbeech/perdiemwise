import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";
import { getAccount } from "@/lib/account";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { captureServerError } from "@/lib/observability";

function isMissingCustomer(e: unknown): boolean {
  const err = e as { code?: string; param?: string };
  return err?.code === "resource_missing" && err?.param === "customer";
}

// Opens the Stripe Billing Portal so a Pro user can update their card, view
// invoices, or cancel — no bespoke billing UI to build or keep secure.
export async function POST(request: Request) {
  const account = await getAccount();
  if (!account?.profile?.stripe_customer_id || !stripeConfigured()) {
    return NextResponse.json({ error: "No billing account found." }, { status: 400 });
  }
  const stripe = getStripe()!;
  const base = SITE.url;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: account.profile.stripe_customer_id,
      return_url: `${base}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    // Stale customer id (mode switch / deleted customer) — same recovery as checkout.
    if (isMissingCustomer(e)) {
      captureServerError(e, { scope: "stripe-portal", userId: account.user.id, code: "resource_missing" });
      return NextResponse.json(
        { error: "Your billing record needs to be reconnected. Please email hello@perdiemwise.com to sort this out." },
        { status: 409 },
      );
    }
    captureServerError(e, { scope: "stripe-portal", userId: account.user.id });
    const message = e instanceof Error ? e.message : "Could not open billing.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
