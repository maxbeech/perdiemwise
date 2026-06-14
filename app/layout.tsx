import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { title: SITE.name, description: SITE.description, url: SITE.url, siteName: SITE.name, type: "website" },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0284c7" };

function Header() {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-stone-900">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-600 text-sm text-white">P</span>
          PerDiem<span className="text-sky-600">Wise</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-stone-600">
          <Link href="/calculators" className="hover:text-stone-900">Calculators</Link>
          <Link href="/per-diem" className="hidden hover:text-stone-900 sm:inline">Per diem rates</Link>
          <Link href="/states" className="hidden hover:text-stone-900 sm:inline">By state</Link>
          <Link href="/blog" className="hover:text-stone-900">Guides</Link>
          <Link href="/pricing" className="rounded-lg bg-stone-900 px-3 py-1.5 font-medium text-white hover:bg-stone-700">Pro</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-stone-100">
      <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-stone-500">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/calculators/per-diem-calculator" className="hover:text-stone-900">Per diem calculator</Link>
          <Link href="/calculators/mileage-reimbursement-calculator" className="hover:text-stone-900">Mileage calculator</Link>
          <Link href="/calculators/meals-and-incidentals-calculator" className="hover:text-stone-900">M&amp;IE calculator</Link>
          <Link href="/per-diem" className="hover:text-stone-900">Per diem rates by city</Link>
          <Link href="/states" className="hover:text-stone-900">By state</Link>
          <Link href="/blog" className="hover:text-stone-900">Guides</Link>
          <Link href="/methodology" className="hover:text-stone-900">Methodology &amp; sources</Link>
          <Link href="/pricing" className="hover:text-stone-900">Pro</Link>
        </div>
        <p className="mt-4 max-w-2xl text-xs text-stone-400">
          {SITE.name} uses the official GSA FY2026 CONUS per diem rates and the 2026 IRS standard
          mileage rates. It is a planning aid — always confirm figures against your employer&apos;s
          travel policy or the official GSA and IRS publications before filing a claim.
          © {new Date().getFullYear()} {SITE.name}.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <Header />
        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
