import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const account = await getAccount();
  if (!account) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { teamId?: string; email?: string };
  const email = body.email?.trim().toLowerCase();
  if (!body.teamId || !email || !email.includes("@")) return NextResponse.json({ error: "A team and valid email are required." }, { status: 400 });
  const admin = createAdminClient();
  const { data: team } = await admin.from("teams").select("id, name").eq("id", body.teamId).eq("owner_id", account.user.id).maybeSingle();
  if (!team) return NextResponse.json({ error: "Only the team owner can invite members." }, { status: 403 });
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const { error } = await admin.from("team_invites").insert({ team_id: team.id, email, token_hash: tokenHash, expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  return NextResponse.json({ inviteUrl: `${base}/team/accept?token=${rawToken}`, expiresInDays: 7, delivery: "copy_link" });
}
