import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { analyticsPlan, analyticsUserRef } from "@/lib/analytics-contract";

// Tells the browser who to report events for. Only the one-way user reference
// and the plan leave the server, never the user id or the email address.
export async function GET() {
  const account = await getAccount();
  const body = account
    ? { userRef: await analyticsUserRef(account.user.id), plan: analyticsPlan(account.profile?.plan) }
    : { userRef: null };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
