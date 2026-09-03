import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccount();
  if (!account) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const admin = createAdminClient();
  const { data: membership } = await admin.from("team_members").select("role").eq("team_id", id).eq("user_id", account.user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "You are not a member of this team." }, { status: 403 });
  const { data: memberRows, error: memberError } = await admin.from("team_members").select("user_id, role, created_at").eq("team_id", id);
  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 502 });
  const userIds = (memberRows ?? []).map((m) => m.user_id);
  const { data: profiles } = userIds.length ? await admin.from("profiles").select("id, email, full_name").in("id", userIds) : { data: [] };
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const members = (memberRows ?? []).map((member) => ({ ...member, profile: profileById.get(member.user_id) ?? null }));
  const { data: trips, error: tripError } = userIds.length ? await admin.from("trips").select("id, user_id, kind, name, total, data, created_at").in("user_id", userIds).order("created_at", { ascending: false }) : { data: [], error: null };
  if (tripError) return NextResponse.json({ error: tripError.message }, { status: 502 });
  return NextResponse.json({ members: members ?? [], trips: trips ?? [] });
}
