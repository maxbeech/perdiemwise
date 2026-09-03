# PerDiemWise

Free **GSA per diem & IRS mileage calculator** — [perdiemwise.com](https://perdiemwise.com)

PerDiemWise calculates a US business trip's per diem from the **official GSA FY2026
CONUS rates** (lodging + meals & incidentals) with the **75% first-and-last-day rule**
built in, plus mileage reimbursement at the **2026 IRS standard mileage rates**.

Built by the MaxedLabs Product Factory (Plan 38).

## Real data, no fabrication
- **Per diem:** GSA FY2026 CONUS dataset (`lib/gsa-rates.json`) — 298 non-standard cities
  + the standard rate, retrieved from the GSA per diem API. See `/methodology`.
- **Mileage:** 2026 IRS optional standard mileage rates, date-aware across both 2026
  periods — 72.5¢ business / 20.5¢ medical / 14¢ charitable (Jan 1–Jun 30), then
  76¢ / 23.5¢ / 14¢ from Jul 1 after a mid-year IRS adjustment. See
  `IRS_MILEAGE_2026_PERIODS` and `mileageRateForDate()` in `lib/site.ts`.
- **Blog:** 40 hand-authored SEO posts (`lib/posts.ts`) across Academy/News/Reviews
  categories, each with a featured image (`public/images/blog/`), FAQ/HowTo JSON-LD,
  and internal links — no CMS.
- Destinations not separately listed by GSA fall back to the standard CONUS rate, and the
  UI says so explicitly — never a guessed number.

## Design system
A deliberate "premium expense ledger" aesthetic — warm ivory paper, deep ink, a forest-emerald
accent, **Fraunces** (display) + **Hanken Grotesk** (body) + **IBM Plex Mono** (every figure, via
the `.tnum` class). Tokens live in `app/globals.css` (`@theme`); reusable primitives
(`Container`, `Button`, `Eyebrow`, `Badge`, `Card`, `SectionHead`) in `components/ui.tsx` — the
single source of truth for layout and styling across every page.

## Stack
Next.js 16 (App Router, SSG/ISR, `proxy.ts`) · Tailwind CSS 4 · TypeScript · `tsx` tests ·
`next/font` · **Supabase** (auth + Postgres, RLS) · **Stripe** (subscriptions + webhook +
billing portal). Marketing/city pages stay fully static; only `/account`, `/login` and the
API routes are dynamic — the auth session proxy is scoped to those, so the SEO surface never
pays a per-request auth cost.

## Develop
```bash
npm install
npm test        # engine + data-integrity unit tests
npm run dev     # http://localhost:3000
npm run build   # production build
```

## SEO footprint
~360 static pages: a per-city per-diem page for each GSA location (`/per-diem/<city-st>`),
a hub for each state (`/states/<state>`), three calculators, and the guides. Sitemap,
robots, JSON-LD and canonical URLs included.

## Features
- **Per diem trip calculator** — per-night lodging (each night at its month's GSA rate),
  M&IE with the 75% first/last-day rule, same-day-trip and standard-CONUS fallback.
- **Provided-meal deductions** — tick breakfast/lunch/dinner provided; M&IE is reduced
  accordingly (incidentals always retained), on both the trip and M&IE calculators.
- **Mileage reimbursement** — 2026 IRS rates (business/medical/charity), multi-leg.
- **OCONUS awareness** — Alaska/Hawaii/territories/international are flagged (they use
  DoD/State Dept rates, not the GSA CONUS table) instead of silently using the standard rate.
- **Accessibility** — the city picker is a keyboard-navigable ARIA combobox (single shared
  `CityCombobox` component — one source of truth).
- **Copy summary** — copies an itemised voucher-ready breakdown (with a selectable-box
  fallback if the clipboard API is blocked).

## Pro tier (accounts + subscription)
Signed-in users get a passwordless (magic-link) account; **Pro** ($9/mo or $90/yr) unlocks:
- **Cloud-synced trips** — save from either calculator to your account; they follow you across
  devices (Supabase `trips` table, RLS-scoped; writes require an active Pro plan).
- **Professional expense report** — a print-perfect, IRS/GSA-compliant PDF at `/account/report`
  (per-diem day-by-day + mileage log + grand total), recomputed live from GSA data so the export
  is always internally consistent. "Download / Print PDF" uses the browser's print-to-PDF (zero deps).
- **CSV export** and **batch** of multiple trips into one report.
- **Running-year ledger** — the account dashboard totals saved records for the current year as they are logged.
- **Truck-driver records** — the IRS transportation-industry $80 CONUS / $86 OCONUS rate and 80% deduction are available on the dedicated driver calculator; saved records appear in Pro reports.
- **Team workspace** — bookkeepers can create a workspace, issue expiring invite links and review member trip totals in one ledger. Team billing uses real Stripe price IDs when configured.
- **Billing self-service** via the Stripe Billing Portal.

Free stays fully useful: all calculators, provided-meal deductions, OCONUS awareness, copy-ready
summaries, and up to 10 on-device (localStorage) saved trips. Pro keeps the ongoing ledger in the cloud.

### Architecture
`lib/supabase/{client,server,admin}.ts` (browser / SSR / service-role) · `proxy.ts` refreshes the
session on auth routes · `lib/account.ts` is the server "who am I + am I Pro" source of truth ·
`lib/stripe.ts` the price registry. Checkout (`/api/checkout`) ties the subscription to the user;
the **webhook** (`/api/stripe/webhook`) is the *only* path that can set `plan = 'pro'` (users have
no write policy on that column). Schema: `supabase/migrations/0001_accounts_and_trips.sql`.

## Environment
- `NEXT_PUBLIC_SITE_URL` — canonical/OG/sitemap base. **When you connect `perdiemwise.com`, set
  `NEXT_PUBLIC_SITE_URL=https://perdiemwise.com` in Vercel and redeploy.**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — auth + DB.
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_MONTHLY`,
  `STRIPE_PRICE_ID_ANNUAL`, `STRIPE_PRICE_ID_TEAM_MONTHLY`, `STRIPE_PRICE_ID_TEAM_ANNUAL`, `STRIPE_WEBHOOK_SECRET` — subscriptions. Absent → checkout degrades to a
  503 early-access note; the free tools are unaffected. Use **test** keys locally (`stripe listen`
  for the webhook secret), **live** keys in Vercel production.
- `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` — error monitoring (org `maxed-labs`, project
  `perdiemwise_web`). Not secret; absent → the SDK is a silent no-op. `SENTRY_AUTH_TOKEN` is
  optional (source-map upload only — the build succeeds without it, just unsymbolicated).

## Roadmap (next)
Google OAuth sign-in; custom employer rate with taxable-excess flag;
multi-destination trips; OCONUS/international rate data; historical fiscal-year rates.
