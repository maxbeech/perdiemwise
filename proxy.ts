import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request and re-writes the
// rotated auth cookies onto the response, so Server Components always observe a
// valid, non-expired session. Scoped (see config.matcher) to auth routes only,
// so marketing/city pages stay fully static. (Next 16 "proxy" convention.)
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the user to trigger a refresh when the access token is stale.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Only routes that read the session server-side. Marketing + city pages stay
  // fully static (no per-request Supabase call), preserving the ISR strategy.
  matcher: ["/account/:path*", "/login", "/api/checkout", "/api/stripe/portal"],
};
