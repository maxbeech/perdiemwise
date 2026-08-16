# Changelog

All notable changes to PerDiemWise are documented here.

## [0.3.0] — 2026-07-25 — Blog expansion, featured images & mid-year mileage-rate fix

### Fixed
- **IRS mileage rate**: the 2026 business/medical/moving rate rose mid-year
  (72.5¢→76¢ business, 20.5¢→23.5¢ medical/moving, effective 1 July 2026,
  per IRS Announcement 2026-11). `lib/site.ts` was still hardcoded to the
  January rate only. Replaced the flat `IRS_MILEAGE_2026` constant with a
  date-aware `IRS_MILEAGE_2026_PERIODS` table and `mileageRateForDate()`
  helper; `lib/mileage.ts`, the mileage calculator, the Pro expense-report
  PDF, `/methodology`, and homepage marketing copy now all resolve the rate
  in effect for the travel date instead of a single stale figure. All 40
  blog posts that cited the flat rate were updated to reflect both periods.

### Added
- **Blog content model**: `lib/posts.ts`'s `Post`/`Block` types extended with
  `category` (Academy/News/Reviews), `featuredImage`, `schemaType`
  (Article/HowTo/FAQPage/Review), `review`, `supportingKeywords` and
  `longTailPhrases`. New `Block` variants: `table`, `quote`, `callout`, `faq`.
  `app/blog/[slug]/page.tsx` renders TOC, FAQ/HowTo/Review JSON-LD, featured
  images with credit lines, and inline markdown-style links.
- **15 new blog posts** (`WEEK3_POSTS`) covering FTR, GSA rate methodology,
  DC/NYC seasonal per diem, CONUS/OCONUS, mileage logs, mileage-tracking-app
  and expense-report-software comparisons, and 2026 mileage-rate analysis —
  sourced against `docs/seo_geo_content_plan.md`'s keyword strategy.
- **Featured images for all 40 posts** (25 existing + 15 new): real stock
  photography sourced via Pipedream (Pexels), downloaded to
  `public/images/blog/`, with photographer credit/attribution on each post.
- `test/perdiem.test.mts`: mileage engine tests now cover both 2026 rate
  periods explicitly by date. 32 checks pass.

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
