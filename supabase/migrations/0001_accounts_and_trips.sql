-- PerDiemWise accounts + cloud-synced trips.
-- Single source of truth for the app's database schema. Applied to project
-- yrilexkzhwigzakqjivx. RLS enforced everywhere; profile writes (plan changes)
-- go only through the service role (Stripe webhook) so users cannot self-upgrade.

-- ── profiles ──────────────────────────────────────────────────────────────
-- One row per auth user. Mirrors billing state pushed from Stripe.
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text,
  full_name           text,
  stripe_customer_id  text unique,
  plan                text not null default 'free',      -- 'free' | 'pro' | 'team'
  subscription_status text,                              -- stripe status mirror
  current_period_end  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users may read ONLY their own profile. No client insert/update policy exists,
-- so plan/subscription columns are writable only by the service role.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

-- ── trips (Pro: cloud-synced) ───────────────────────────────────────────────
create table if not exists public.trips (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null default 'perdiem',            -- 'perdiem' | 'mileage' | 'trucker'
  name       text not null,
  data       jsonb not null,                             -- inputs + result snapshot
  total      numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_user_created_idx
  on public.trips (user_id, created_at desc);

alter table public.trips enable row level security;

-- Read/delete your own trips regardless of plan (so a downgraded user keeps
-- access to their data). Writes require an active Pro plan, checked against the
-- caller's own profile row (readable via profiles_select_own).
drop policy if exists "trips_select_own" on public.trips;
create policy "trips_select_own" on public.trips
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "trips_delete_own" on public.trips;
create policy "trips_delete_own" on public.trips
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "trips_insert_pro" on public.trips;
create policy "trips_insert_pro" on public.trips
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.plan = 'pro'
    )
  );

drop policy if exists "trips_update_pro" on public.trips;
create policy "trips_update_pro" on public.trips
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.plan = 'pro'
    )
  );

-- ── new-user provisioning ───────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Data API grants (tables created via raw SQL are not auto-granted) ────────
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.trips to authenticated;
