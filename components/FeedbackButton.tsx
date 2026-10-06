"use client";

import { useState } from "react";
import { openFeedback, type FeedbackUser } from "@/lib/feedback";
import { SITE } from "@/lib/site";

type Variant = "header" | "menu" | "footer";

const STYLES: Record<Variant, string> = {
  header: "inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink",
  menu: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-paper-2",
  footer: "text-ink-soft transition-colors hover:text-accent",
};

function BubbleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 11H7l-3 2.5V11a1.5 1.5 0 0 1-1.5-1.5v-6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Best-effort read of the signed-in user, so the form is pre-filled. */
async function currentUser(): Promise<FeedbackUser | null> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const { data } = await createClient().auth.getUser();
    const u = data.user;
    if (!u) return null;
    const meta = (u.user_metadata ?? {}) as { full_name?: string; name?: string };
    return { id: u.id, email: u.email ?? null, name: meta.full_name ?? meta.name ?? null };
  } catch {
    return null;
  }
}

/**
 * The single user-facing feedback control. It opens Sentry's feedback form, so
 * a report lands in the same project as the exceptions from the code. Sentry is
 * imported on click so marketing pages do not carry it for a link.
 */
export default function FeedbackButton({ variant = "header", className = "" }: { variant?: Variant; className?: string }) {
  const [unavailable, setUnavailable] = useState(false);

  async function open() {
    try {
      const Sentry = await import("@sentry/nextjs");
      const result = await openFeedback(Sentry as unknown as Parameters<typeof openFeedback>[0], await currentUser());
      if (result === "unavailable") setUnavailable(true);
    } catch (e) {
      console.error("[feedback] could not open the form", e instanceof Error ? e.message : e);
      setUnavailable(true);
    }
  }

  if (unavailable) {
    return (
      <a className={`${STYLES[variant]} ${className}`} href={`mailto:${SITE.email}`}>
        Email {SITE.email}
      </a>
    );
  }

  return (
    <button type="button" onClick={open} className={`${STYLES[variant]} ${className}`} data-testid="feedback-button">
      {variant !== "footer" && <BubbleIcon />}
      Send feedback
    </button>
  );
}
