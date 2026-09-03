import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const account = await getAccount();
  if (!account) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("team_members").select("team_id, role, teams(id, name, owner_id, created_at)").eq("user_id", account.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  return NextResponse.json({ teams: data ?? [] });
}

export async function POST(request: Request) {
  const account = await getAccount();
  if (!account) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { name?: string };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Enter a team name." }, { status: 400 });
  const admin = createAdminClient();
  const { data: team, error } = await admin.from("teams").insert({ owner_id: account.user.id, name }).select("id, name, owner_id, created_at").single();
  if (error || !team) return NextResponse.json({ error: error?.message ?? "Could not create the team." }, { status: 502 });
  const { error: memberError } = await admin.from("team_members").insert({ team_id: team.id, user_id: account.user.id, role: "owner" });
  if (memberError) {
    await admin.from("teams").delete().eq("id", team.id);
    return NextResponse.json({ error: memberError.message }, { status: 502 });
  }
  return NextResponse.json({ team }, { status: 201 });
}
