import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/site";
import { Button, Container } from "@/components/ui";

const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz"] });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { title: SITE.name, description: SITE.description, url: SITE.url, siteName: SITE.name, type: "website" },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0e6b46" };

const NAV = [
  { href: "/calculators", label: "Calculators" },
  { href: "/per-diem", label: "Per diem rates" },
  { href: "/states", label: "By state" },
  { href: "/blog", label: "Guides" },
  { href: "/pricing", label: "Pricing" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label={SITE.name}>
      <span className="relative grid h-8 w-8 place-items-center rounded-[9px] bg-accent text-paper shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
        <span className="font-display text-[17px] font-semibold leading-none">P</span>
        <span className="absolute bottom-1 left-1.5 right-1.5 h-px bg-paper/40" aria-hidden />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-ink">PerDiem<span className="text-accent">Wise</span></span>
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Wordmark />
        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          {NAV.map((n) => <Link key={n.href} href={n.href} className="transition-colors hover:text-ink">{n.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Button href="/calculators/per-diem-calculator" size="sm">Open the calculator</Button>
        </div>
        <details className="relative md:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-line bg-surface text-ink [&::-webkit-details-marker]:hidden" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </summary>
          <div className="absolute right-0 top-12 w-56 rounded-2xl border border-line bg-surface p-2 shadow-xl">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-paper-2">{n.label}</Link>)}
            <Link href="/calculators/per-diem-calculator" className="mt-1 block rounded-lg bg-accent px-3 py-2 text-center text-sm font-medium text-white">Open the calculator</Link>
          </div>
        </details>
      </Container>
    </header>
  );
}

function Footer() {
  const cols = [
    { h: "Calculators", links: [["/calculators/per-diem-calculator", "Per diem calculator"], ["/calculators/mileage-reimbursement-calculator", "Mileage calculator"], ["/calculators/meals-and-incidentals-calculator", "M&IE calculator"]] },
    { h: "Rates", links: [["/per-diem", "Rates by city"], ["/states", "Rates by state"], ["/methodology", "Methodology & sources"]] },
    { h: "Company", links: [["/blog", "Guides"], ["/pricing", "Pricing"], [`mailto:${SITE.email}`, "Contact"]] },
  ];
  return (
    <footer className="mt-24 border-t border-line bg-paper-2/60">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">Official GSA &amp; IRS travel-reimbursement rates, made calculable. {SITE.fyShort} data.</p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{c.h}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={href}><Link href={href} className="text-ink-soft transition-colors hover:text-accent">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. An independent tool — not affiliated with the GSA or IRS.</p>
          <p>Built on official GSA {SITE.fyShort} &amp; 2026 IRS data · <Link href="/methodology" className="underline decoration-line underline-offset-2 hover:text-accent">sources</Link></p>
        </div>
      </Container>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
