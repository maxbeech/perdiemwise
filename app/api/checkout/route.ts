import { NextResponse } from "next/server";

// Stripe Checkout for PerDiemWise Pro. Keys arrive as Vercel env vars
// (STRIPE_SECRET_KEY, STRIPE_PRICE_ID). When absent — before the Stripe account
// is wired — the route degrades gracefully (503 + early-access note) instead of
// throwing, so the free calculators are never affected.
export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://perdiemwise.vercel.app";

  if (!secret || !price) {
    return NextResponse.json(
      { error: "PerDiemWise Pro is launching shortly. Email hello@perdiemwise.com for early access." },
      { status: 503 },
    );
  }

  try {
    const body = new URLSearchParams({
      "mode": "subscription",
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      "success_url": `${base}/pricing?status=success`,
      "cancel_url": `${base}/pricing?status=cancel`,
      "allow_promotion_codes": "true",
    });
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const session = await res.json();
    if (!res.ok) return NextResponse.json({ error: session?.error?.message ?? "Stripe error" }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Could not reach Stripe." }, { status: 502 });
  }
}
