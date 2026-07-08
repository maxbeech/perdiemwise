import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Supabase client — bound to the request's cookie jar so Server
// Components, Route Handlers and Server Actions all read the signed-in user.
// `cookies()` is async in Next 16. The setAll try/catch swallows the
// "can't set cookies from a Server Component render" case (session refresh then
// happens in middleware instead).
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* called from a Server Component — middleware refreshes instead */
          }
        },
      },
    },
  );
}
