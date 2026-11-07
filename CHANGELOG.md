# Changelog

## 2026-11-06: active return measurement

- Record first measured visits and intentional returns using the shared three-hour, seven-day browser contract.
- Preserve the product analytics boundary and add regression tests for passive tabs, continuous sessions, consent and storage errors.

## [Unreleased] — 2026-11-04 — Lifecycle refresh: FY2027 figures in three more posts

### Changed
- `gsa-per-diem-rates-explained`: standard CONUS rate is $113 lodging + $68 M&IE for FY2027 (was $110), $181 a day combined. NSA count is 295 for FY2027 (was roughly 296). The M&IE tier table is relabelled "not revised for FY2027" with the same tier values. The frozen-rates section is reworded to cover the FY2027 $3 lodging rise and Allentown, PA moving to the standard rate. The FAQ question on FY2026 was replaced with "What changed in the FY2027 per diem rates?". Source: GSA FY 2027 per diem highlights (https://www.gsa.gov/system/files/FY2027perdiemhighlights.docx).
- `oconus-vs-conus-per-diem`: the standard CONUS reference is $113 lodging / $68 M&IE for FY2027 in the intro, the comparison table, the territory row and the FAQ.
- `lodging-rates-change-by-season`: the San Francisco cap is labelled as the FY2026 figure ($259, rising to $272) rather than presented as the current rate. The post now points to the San Francisco per diem page for the FY2027 month-by-month table.
- Publish dates are unchanged on all three posts.

### Deferred
- `per-diem-rates-2026-conus-table`: the whole post is built on FY2026 city tables (lodging ranges, DC and NYC monthly caps, FAQ). It needs the FY2027 non-standard-area table, which is not yet in `lib/gsa-rates.json`, so it is not partially edited here.

### Added
- `test/fy-rate-currency.test.mts` now also guards these three posts against FY2026 figures presented as current.

### Known gap
- Unchanged: `lib/gsa-rates.json` and the `/per-diem/*` pages still use the FY2026 dataset. These posts now state FY2027 standard figures, so they disagree with the calculator until the dataset is regenerated.

## [Unreleased] — 2026-11-03 — Blog BlogPosting author matches the visible byline (GEO authorship)

### Changed
- `app/blog/[slug]/page.tsx`: the BlogPosting JSON-LD `author` now names the same byline the page shows (`PerDiemWise Content Team`, or a post's own `author`) instead of the site name. No named human author exists yet, so no `Person` schema is emitted; that remains open.

## [Unreleased] — 2026-11-03 — Injected-script errors out of Sentry (PERDIEMWISE_WEB-5)

### Changed
- "Object Not Found Matching Id:2, MethodName:update, ParamCount:4" is a native bridge injected into some in-app browsers and WebViews rejecting its own call, on a blog page, with no frame of ours. The browser Sentry init and `beforeSend` now use the shared rules in `lib/sentry-client-noise.ts` (generated from `ProductFactory/_services/sentry-client-noise`), which also cover wallet extensions, a stackless `undefined` rejection and translated-page DOM errors. The existing auth-js filter (`lib/sentry-filters.ts`) is unchanged.
- `test/sentry-client-noise.test.ts` is new and runs in `npm test`.

## [Unreleased] — 2026-10-27 — Lifecycle refresh: FY2027 figures in four more posts

### Changed
- `per-diem-vs-mileage-reimbursement`: standard CONUS rate is now $113 lodging + $68 M&IE for FY2027 (was $110 + $68). The combined worked example is $317.80 (was $314.80). The pre-July example keeps its FY2026 $110 figure, labelled as FY2026 ($308.50). The FAQ and side-by-side table were updated to match.
- `per-diem-policy-example`: the unlisted-destination row and the GSA-rate paragraph now state the FY2027 standard rate ($113 lodging / $68 M&IE).
- `gsa-per-diem-first-and-last-day-75-percent-rule`: the first/last-day tier table is labelled FY2027. The tiers are unchanged from FY2026 (GSA did not revise them for FY2027); the figures themselves are not changed.
- `are-provided-meals-deducted-from-per-diem`: the M&IE breakdown heading and caption are labelled FY2027, noting the tiers are unchanged. The figures themselves are not changed.
- Publish dates are unchanged on all four posts.

### Added
- `test/fy-rate-currency.test.mts` now also guards these four posts against FY2026 figures presented as current.

### Known gap
- Unchanged: `lib/gsa-rates.json` and the `/per-diem/*` pages still use the FY2026 dataset. The four posts above now state FY2027 standard lodging ($113), so they disagree with the calculator's $110 fallback until the dataset is regenerated.
- `travel-nurse-per-diem-explained` points readers to the calculator for the "current" FY2026 rate; it is deferred until the calculator dataset is regenerated, so it is not refreshed here.

## [Unreleased] — 2026-10-21 — Lifecycle refresh: FY2027 figures in three guides

### Changed
- `how-to-calculate-per-diem-for-a-business-trip`: standard CONUS rate is now $113 lodging + $68 M&IE for FY2027 (was FY2026 $110 + $68). The 3-night worked example is now $339 lodging + $238 M&IE = $577 (was $568). The FAQ and the "destination not listed" fallback were updated to match.
- `what-does-per-diem-cover`: added a sentence stating the FY2027 M&IE figure is unchanged and the standard lodging cap moved from $110 to $113; the M&IE table is now labelled FY2027.
- `meals-and-incidentals-mie-breakdown-explained`: the tier table and heading are labelled FY2027, with a sourced note that GSA did not revise the M&IE tiers for FY2027. The figures themselves are unchanged. The description and long-tail phrase now say FY2027.
- Publish dates are unchanged on all three posts.

### Added
- `test/fy-rate-currency.test.mts` guards the three refreshed posts against FY2026 figures presented as current. Wired into `npm test`.

### Known gap
- Unchanged from 2026-10-16: `lib/gsa-rates.json` and the `/per-diem/*` city pages (and the home page's "Official GSA FY2026 rates" line) still use the FY2026 dataset. Regenerating that dataset from GSA's FY2027 data is a separate, larger change.

## [Unreleased] — 2026-10-16 — FY2027 per diem refresh for five posts

### Changed
- Refreshed five blog posts from FY2026 to FY2027 GSA per diem rates (effective 1 October 2026 to 30 September 2027): `what-is-per-diem`, `standard-conus-per-diem-rate-explained`, `conus-per-diem-rates-standard`, `washington-dc-per-diem-rate` and `per-diem-nyc-seasonal-rates`.
- Standard CONUS rate in those posts is now $113 lodging + $68 M&IE = $181/day (was $110 + $68 = $178). Source: GSA FY 2027 per diem highlights. The M&IE tiers are unchanged ($68–$92).
- Washington DC and New York City monthly lodging tables, the NYC worked example and the DC worked example now use GSA FY2027 values from the GSA per diem API.
- The conus rates post's FY2026 expert quote was replaced with a verbatim sentence from the GSA FY 2027 highlights, so the post keeps its quote block.

### Known gap
- `lib/gsa-rates.json` and the `/per-diem/*` city pages still use the FY2026 dataset (fetched 2026-06-14). Until that dataset is regenerated from GSA's FY2027 data, the calculator and these refreshed posts disagree on lodging rates.

## [Unreleased] — 2026-10-09 — Machine-readability foundations

### Added
- `/llms.txt`, generated from the calculator, guide, site and price data so it cannot drift from the site.
- Organization and WebSite structured data on the home page.
- Pricing page SoftwareApplication structured data with one Offer per plan, taken from the same `PRICING` values the page displays.
- BreadcrumbList structured data on calculator and state pages, matching their visible navigation.
- Explicit `Allow: /` rules in robots.txt for GPTBot, ClaudeBot, PerplexityBot, Google-Extended and CCBot.

### Fixed
- The home FAQ and the mileage calculator copy stated the 2026 IRS business rate as 72.5¢ for the whole year. They now state the 72.5¢ (January to June) and 76¢ (from July 1) split that the rest of the site and `lib/site.ts` use.

## [Unreleased] — 2026-10-08 — Search Console canonical hardening

### Fixed
- Made `https://www.perdiemwise.com` the single immutable public origin for canonical tags,
  structured data, sitemap entries, robots and Stripe/team return URLs. A stale build environment
  value can no longer reintroduce apex URLs.
- Marked the generated `/opengraph-image` PNG `X-Robots-Tag: noindex`, so cache-busted social
  preview asset URLs are crawlable by preview clients but are not candidates for Google's page index.
- Confirmed the existing content corpus is substantive and source-backed; no filler rewrite was
  warranted for the two reported indexing examples.

## [Unreleased] — 2026-10-08 — Blog publication-contract hardening

### Changed
- Refreshed the 15-post Academy/News/Reviews publication batch across 1–7 October
  and tightened every title and meta description to the search-snippet limits.
- Added two official, on-page further-reading links to every campaign article. The
  sources live with the typed post registry, so routes, sitemap and article rendering
  continue to share one source of truth.

### Tests
- Added `test/blog-content.test.mts`, which checks batch size, dates, titles,
  descriptions, keyword metadata, word count, links, citations, FAQs, tables, image
  files and blog registry membership.

## 2026-10-07: Sentry scrubber security pass

- **Long secrets.** JWTs, bearer tokens, vendor keys (`sk_`, `whsec_`, `hlm_sk_`, `sntrys_`) and `key=value` secrets of any length are now redacted whole. The old bounded patterns left the tail of anything longer than their limit.
- **Truncation.** The 10k cut backs up to the previous delimiter, so half a secret can never survive at the boundary.
- **Encodings, URLs and key names.** URL queries and fragments (OAuth and magic-link tokens), percent-encoded emails, `Bearer%20...`, `token%3D...`, escaped JSON, `Authorization: Basic ...`, connection-string credentials and keys such as `passwd`, `pwd`, `jwt` and `Set-Cookie` are covered at any depth.
- **Fail closed, no bypass.** Events, transactions, breadcrumbs and logs are dropped if scrubbing throws. A second deep pass scrubs stack-frame vars, spans, contexts and tags, feedback events included (only the reporter's own `contexts.feedback` and user are kept).
- **Tests.** `test/scrub-hardening.test.mts` covers long JWTs, varied key lengths, secrets straddling the truncation boundary, hostile 20k strings, key variants and fail-closed behaviour.

All notable changes to PerDiemWise are documented here.

## [Unreleased] — 2026-10-07 — Scrubber fix

### Security
- Feedback events no longer skip the Sentry scrubber. They keep only the reporter's own
  `contexts.feedback` and `user` (name, email, message); breadcrumbs, request, tags, extra and
  every other context are scrubbed as normal. Added tests for both, including fail-closed.

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

Generated Node analytics tests assert the empty error count without narrowing the mutable collection to `never[]`; storage-error checks remain unchanged.

2026-11-06: The shared GA bootstrap disables implicit page views before startup, so the explicit route tracker owns the initial and subsequent SPA page views. Product value and active-return events remain enabled.
