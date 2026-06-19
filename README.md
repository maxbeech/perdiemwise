# PerDiemWise

Free **GSA per diem & IRS mileage calculator** — [perdiemwise.com](https://perdiemwise.com)

PerDiemWise calculates a US business trip's per diem from the **official GSA FY2026
CONUS rates** (lodging + meals & incidentals) with the **75% first-and-last-day rule**
built in, plus mileage reimbursement at the **2026 IRS standard mileage rates**.

Built by the MaxedLabs Product Factory (Plan 38).

## Real data, no fabrication
- **Per diem:** GSA FY2026 CONUS dataset (`lib/gsa-rates.json`) — 298 non-standard cities
  + the standard rate, retrieved from the GSA per diem API. See `/methodology`.
- **Mileage:** 2026 IRS optional standard mileage rates (72.5¢ business · 20.5¢ medical
  · 14¢ charitable), `lib/site.ts`.
- Destinations not separately listed by GSA fall back to the standard CONUS rate, and the
  UI says so explicitly — never a guessed number.

## Stack
Next.js 16 (App Router, SSG/ISR) · Tailwind CSS 4 · TypeScript · `tsx` tests · env-gated
Stripe checkout. The free calculators need no database.

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

## Environment
- `NEXT_PUBLIC_SITE_URL` — canonical/OG/sitemap base. **Defaults to the live Vercel URL**
  so everything resolves today. **When you connect `perdiemwise.com`, set
  `NEXT_PUBLIC_SITE_URL=https://perdiemwise.com` in Vercel and redeploy** so canonicals
  point at the custom domain.
- `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` — enable Pro checkout. Absent → checkout
  degrades to a 503 early-access note; the free tools are unaffected.

## Roadmap (next)
Custom employer rate with taxable-excess flag; multi-destination trips; expense-report
PDF + CSV export; OCONUS/international rate data; historical fiscal-year rates.
