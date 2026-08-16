"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_ATTEMPTS = 5;

// Shown on /account right after a successful Stripe redirect, while we wait
// for the checkout.session.completed webhook to flip profiles.plan to 'pro'.
// Polls via router.refresh() instead of showing the upgrade button again,
// which would risk a second concurrent subscription if clicked twice.
export default function CheckoutPending() {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) return;
    const timer = setTimeout(() => {
      setAttempts((a) => a + 1);
      router.refresh();
    }, 1500);
    return () => clearTimeout(timer);
  }, [attempts, router]);

  if (attempts >= MAX_ATTEMPTS) {
    return (
      <p className="text-sm text-muted">
        Still finishing up. If this doesn&rsquo;t update within a minute, refresh the page or email{" "}
        <a href="mailto:hello@perdiemwise.com" className="text-accent hover:underline">hello@perdiemwise.com</a>.
      </p>
    );
  }

  return <p className="text-sm text-accent-dark">🎉 Payment received — activating your Pro plan…</p>;
}
