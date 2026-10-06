import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { authEventFor, withAuthEvent } from "@/lib/analytics-contract";
import { logEvent } from "@/lib/observability";

// Magic-link / OAuth landing. Supabase sends users here either with a PKCE
// `code` (browser-initiated sign-in) or a `token_hash` + `type` (OTP / email
// confirmation). We handle both, set the session cookie, then forward to
// `next`. On failure we return to /login with an error flag. On success the
// redirect carries `oh_auth=sign_up|login` so the next page can report which.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/account";
  const safeNext = next.startsWith("/") ? next : "/account";

  const supabase = await createClient();

  // Where to send a signed-in user, tagged with whether this was a first sign-in.
  async function signedIn() {
    const { data } = await supabase.auth.getUser();
    const target = data.user ? withAuthEvent(safeNext, authEventFor(data.user)) : safeNext;
    return NextResponse.redirect(`${origin}${target}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return signedIn();
    logEvent("warn", "auth callback rejected", { step: "exchange-code", code: error.code });
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return signedIn();
    logEvent("warn", "auth callback rejected", { step: "verify-otp", code: error.code });
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
