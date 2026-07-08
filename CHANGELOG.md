# Changelog

All notable changes to PerDiemWise are documented here.

## [0.2.0] — 2026-07-08 — Accounts & Pro

The free product gains a real revenue tier: passwordless accounts, a Stripe
subscription, and Pro features people actually pay for.

### Added
- **Accounts** — passwordless (magic-link / OTP) sign-in via Supabase Auth
  (`/login`, `/auth/callback`, `/account`). A DB trigger provisions a profile
  row on first sign-in. Header shows Account / Sign in (client-side, so marketing
  pages stay static).
- **PerDiemWise Pro** — $9/mo or $90/yr Stripe subscription. Monthly/annual toggle,
  hosted Stripe Checkout tied to the user, and the **Stripe Billing Portal** for
  self-service card/cancellation.
- **Stripe webhook** (`/api/stripe/webhook`) — verifies the raw-body signature and
  is the only path that can set `plan = 'pro'`; mirrors subscription status +
  renewal date onto the profile. Handles create/update/delete + checkout completion.
- **Cloud-synced trips (Pro)** — "☁ Save to account" on both calculators writes to a
  Supabase `trips` table (RLS-scoped; insert/update require an active Pro plan).
  The account dashboard lists them, imports on-device trips, and deletes.
- **Professional expense report (Pro)** — `/account/report`: a print-perfect,
  IRS/GSA-compliant document (per-diem day-by-day + mileage log + grand total),
  recomputed live from GSA data. "Download / Print PDF" via browser print (zero deps).
- **CSV export (Pro)** — injection-safe CSV of all cloud trips.
- Database schema + RLS: `supabase/migrations/0001_accounts_and_trips.sql`.
- Tests for the report builder (live recompute, mixed totals, skip-invalid) and CSV
  escaping / formula-injection defusing. 30 checks pass.

### Changed
- Pricing page: honest Pro feature list (dropped not-yet-built OCONUS/historical
  claims), monthly/annual pricing, shared `UpgradePanel`.
- Renamed `middleware.ts` → `proxy.ts` (Next 16 convention); scoped to auth routes
  only so all ~360 SEO pages stay fully static (no per-request auth cost).

### Removed
- `components/CheckoutButton.tsx` (superseded by `UpgradePanel`).
