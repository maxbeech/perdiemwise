import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sign out and return to the homepage. POST-only so a prefetch or an image
// loader can never accidentally end a session.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
