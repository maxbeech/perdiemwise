-- Team workspace for bookkeepers and finance managers. Team membership is
-- separate from billing: a Stripe team subscription can be attached to the
-- owner profile, while every member keeps their own auth identity.
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  stripe_customer_id text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists team_members_user_idx on public.team_members (user_id);
create index if not exists team_invites_team_idx on public.team_invites (team_id, created_at desc);
-- A user belongs to one workspace in this first team release. This keeps
-- existing account-level trip rows from being exposed across workspaces; a
-- future version can add an explicit trip-to-team junction for multi-team use.
create unique index if not exists team_members_one_workspace_idx on public.team_members (user_id);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_invites enable row level security;

drop policy if exists "teams_members_read" on public.teams;
create policy "teams_members_read" on public.teams for select to authenticated using (
  exists (select 1 from public.team_members m where m.team_id = id and m.user_id = (select auth.uid()))
);

drop policy if exists "team_members_read_own_teams" on public.team_members;
create policy "team_members_read_own_teams" on public.team_members for select to authenticated using (
  user_id = (select auth.uid())
);

drop policy if exists "team_invites_owner_read" on public.team_invites;
create policy "team_invites_owner_read" on public.team_invites for select to authenticated using (
  exists (select 1 from public.teams t where t.id = team_id and t.owner_id = (select auth.uid()))
);
