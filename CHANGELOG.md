# Changelog

All notable changes to PerDiemWise are documented here.

## [Unreleased] — 2026-10-06 — Sentry standard

### Added
- "Send feedback" control in the header, the mobile menu and the footer. It opens Sentry's
  feedback form (our own button, no injected widget), pre-fills name and email for signed-in
  people, and lands in the `perdiemwise_web` project as User Feedback.
- Structured logs (`enableLogs`, console forwarding, `logEvent`) on client, server and edge.
- One shared scrubber (`lib/scrub.ts`) behind `beforeSend`, `beforeSendLog`, `beforeBreadcrumb`
  and `beforeSendTransaction`: emails, phone numbers, JWTs, bearer tokens, API keys and
  password/secret/token fields are redacted, query strings are stripped from URLs, strings are
  cut at 10k characters before matching, patterns are linear-time, and any scrubber failure
  drops the event instead of sending it raw.
- `lib/observability.ts`: `captureServerError`/`captureServerMessage` keep ids, codes, counts and
  enum values only. Checkout, billing portal, Stripe webhook, team routes, the report builder,
  the account return from Stripe and the client save/upgrade/billing/team flows now report
  failures as Sentry Issues instead of swallowing them.
- Tests for the scrubber (including a long adversarial string and fail-closed), the feedback
  control and the capture helper.

### Changed
- Sentry init lives in `instrumentation.ts` / `instrumentation-client.ts` with shared options
  (`lib/sentry-options.ts`); `sentry.server.config.ts` and `sentry.edge.config.ts` are gone.
- Browser requests go through a randomised tunnel route, so ad blockers do not drop reports.
- A failed profile update in the Stripe webhook now returns 500 (so Stripe retries) instead of
  being ignored.

## 2026-10-01 — 2026-10-01 — User journeys for OpenHelm

### Added
- GA4 journey events: `sign_up`, `login`, `login_link_requested`, `login_failed`,
  `calculation_completed`, `calculation_failed`, `trip_saved`, `trip_save_failed`,
  `begin_checkout`, `checkout_sign_in_required`, `checkout_failed`,
  `checkout_cancelled`, `purchase`, `purchase_confirmation_failed`.
- User properties `oh_user_ref` (16 hex chars of SHA-256 of the Supabase user id,
  computed server-side) and `oh_plan` (`free` or `paid`), set once the visitor is
  signed in and again after a confirmed payment.
- `GET /api/analytics/identity`, the auth callback's `oh_auth` marker and the
  checkout `session_id` return parameter that feed the above.

### Changed
- `lib/openhelm-analytics*.ts[x]` updated to the current shared client, which pushes
  `arguments` into `dataLayer` (plain arrays are ignored by gtag.js).

## [Unreleased] — 2026-09-30 — Hosting moved from Vercel to Helm7

### Changed
- **Hosting moved from Vercel to Helm7.** Supabase (database, auth) and Stripe stay
  where they are. Nothing in the repository depended on Vercel packages, headers or
  `VERCEL_*` variables; what remained was wording and one fallback:
  - `lib/site.ts` falls back to `https://www.perdiemwise.com` instead of the
    `perdiemwise.vercel.app` preview address when `NEXT_PUBLIC_SITE_URL` is unset;
  - README hosting and environment wording, and the Stripe webhook must be registered
    on `https://www.perdiemwise.com/api/stripe/webhook` (the apex redirects);
  - the `.vercel/**` ESLint ignore is gone.
- Tests: `no-vercel` keeps Vercel-only packages, scripts, `maxDuration` and any mention of
  Vercel out of application code (generated service clients excepted).

## [Unreleased] — 2026-09-28 — Sentry backlog: auth-client rejection (PERDIEMWISE_WEB-1)

### Fixed
- **`TypeError: Cannot add property __isAuthError, object is not extensible`
  (PERDIEMWISE_WEB-1)**: last seen 2026-09-27 on release `fb30299`, i.e. before
  the local fix `b4cf6d6` (catch `getUser()` rejections in `AuthNav` and
  `useAccountClient`) was ever deployed. Audit of every client-side
  `supabase.auth.*` call reachable from `/calculators/:slug`: `AuthNav` and
  `useAccountClient` (`getUser`, both now caught), `addCloudTrip`'s `getUser`
  (caught by `SaveToAccountButton`), and the two `onAuthStateChange`
  subscriptions. The last one cannot be caught in app code: auth-js runs
  `_emitInitialSession()` in an un-awaited async IIFE, which is the exact top
  frame of the reported stack. Root cause is not Supabase or Next: auth-js sets
  `__isAuthError` on `this` in the `AuthError` constructor, which only throws
  when the visitor's browser hands back a non-extensible `Error` (extension or
  hardened runtime). The nav falls back to "Sign in", so there is no user
  impact; the message is now dropped via `ignoreErrors`
  (`lib/sentry-filters.ts`, wired into `instrumentation-client.ts`), with tests
  that reproduce the mechanism.

## [Unreleased] — 2026-09-04 — Thin-content fixes & pricing contrast bug

### Fixed
- **Thin programmatic pages**: the 298 `/per-diem/[city]` pages and 51
  `/states/[state]` pages had a rate table and calculator but almost no
  unique prose. Added a data-driven "About" section and a 2–3 item FAQ
  (with FAQPage JSON-LD) to both templates, computed per-page from the real
  GSA dataset — lodging vs. the standard rate, seasonal peak/low months,
  and (state pages) the highest/lowest listed city — rather than templated
  filler text repeated across pages.
- **Thin blog content**: 25 of 40 posts in `lib/posts.ts` (the original `POSTS`
  and `WEEK2_POSTS` batches) were 143–1,000 words with no TL;DR, table, quote
  or FAQ block, well under the content brief's 1,200–2,500 word target. All
  25 rewritten in place (same slug/title/date/keyword) to full spec — TL;DR
  callout, 5+ H2 sections, a data table, a cited GSA/IRS quote, an FAQ block,
  and 3+ internal links — while differentiating topics that overlapped (e.g.
  `standard-conus-per-diem-rate-explained` vs `conus-per-diem-rates-standard`,
  `how-to-set-per-diem-policy` vs `per-diem-policy-example`). Featured images
  were already fully compliant across all 40 posts (verified: every image
  file exists, every post has alt text and a credit).
- **Thin calculator/landing pages**: the 4 `/calculators/[slug]` pages and
  the `/for/bookkeepers` and `/for/truck-drivers` landing pages had almost
  no unique copy beyond the embedded tool. Added an "about" section and an
  FAQ block (with FAQPage JSON-LD) to each.
- **Pricing page contrast bug**: `TeamUpgradePanel`'s `$49/month` price used
  `text-ink` (near-black) on the Team card's own `bg-ink` (near-black)
  background, making it unreadable. Changed to `text-paper`/`text-paper/65`.

## [Unreleased] — 2026-08-24 — Persona paths, ongoing Pro ledger & team workspace

### Added
- Verified truck-driver calculator using IRS Notice 2025-54 transportation-industry rates: $80 CONUS / $86 OCONUS, 80% deductible, with an explicit error outside the verified period.
- Dedicated `/for/truck-drivers` and `/for/bookkeepers` acquisition pages plus the truck-driver calculator in the calculator registry and sitemap.
- Pro running-year totals on the account dashboard and truck-driver records in expense reports.
- Team workspace and expiring invite-link flow for bookkeepers and finance teams, with a migration for teams, members and invites.
- Team Stripe checkout plumbing using `STRIPE_PRICE_ID_TEAM_MONTHLY` / `STRIPE_PRICE_ID_TEAM_ANNUAL`; missing configuration returns a visible availability error.

### Changed
- Free device storage is capped at 10 saved trips with an explicit Pro upgrade prompt; no calculator math was removed from Free.
- Existing profile billing state now supports `team` alongside `free` and `pro`.

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
