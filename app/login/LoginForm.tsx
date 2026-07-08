"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Passwordless sign-in. We send a magic link that lands on /auth/callback and
// forwards to `next`. No passwords to manage; same flow signs up new users.
export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setMessage(null);
    const supabase = createClient();
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent-tint text-accent-dark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">Check your email</h2>
        <p className="mt-2 text-sm text-muted">We sent a secure sign-in link to <span className="font-medium text-ink">{email}</span>. It expires in an hour.</p>
        <button onClick={() => { setStatus("idle"); setEmail(""); }} className="mt-4 text-sm text-accent hover:underline">Use a different email</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-6">
      <label htmlFor="email" className="block text-sm font-medium text-ink-soft">Email address</label>
      <input
        id="email" type="email" required autoComplete="email" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
        className="mt-1.5 w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-ink outline-none transition focus:border-accent"
      />
      <button
        type="submit" disabled={status === "sending"}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending link…" : "Email me a sign-in link"}
      </button>
      {message && <p className="mt-3 text-center text-sm text-clay" role="alert">{message}</p>}
      <p className="mt-4 text-center text-xs text-muted">No password needed. We&apos;ll email you a one-time secure link.</p>
    </form>
  );
}
