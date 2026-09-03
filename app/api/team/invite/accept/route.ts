import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const account = await getAccount();
  if (!account) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { token?: string };
  if (!body.token) return NextResponse.json({ error: "Invitation token is missing." }, { status: 400 });
  const hash = createHash("sha256").update(body.token).digest("hex");
  const admin = createAdminClient();
  const { data: invite } = await admin.from("team_invites").select("id, team_id, email, expires_at, accepted_at").eq("token_hash", hash).maybeSingle();
  if (!invite || invite.accepted_at || new Date(invite.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "This invitation is missing, expired, or already used." }, { status: 410 });
  if (invite.email.toLowerCase() !== (account.user.email ?? "").toLowerCase()) return NextResponse.json({ error: `Sign in with ${invite.email} to accept this invitation.` }, { status: 403 });
  const { error: memberError } = await admin.from("team_members").upsert({ team_id: invite.team_id, user_id: account.user.id, role: "member" });
  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 502 });
  await admin.from("team_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);
  return NextResponse.json({ accepted: true, teamId: invite.team_id });
}
