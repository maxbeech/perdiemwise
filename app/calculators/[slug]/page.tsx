import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CALCS, getCalc } from "@/lib/calculators";
import PerDiemCalculator from "@/components/PerDiemCalculator";
import MileageCalculator from "@/components/MileageCalculator";
import MieCalculator from "@/components/MieCalculator";
import TruckDriverCalculator from "@/components/TruckDriverCalculator";
import { Container, Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site";

/** Renders `[label](href)` markdown-style links inline within plain about-text. */
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    parts.push(
      href.startsWith("/")
        ? <Link key={key++} href={href} className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">{label}</Link>
        : <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">{label}</a>
    );
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export const dynamicParams = false;
export const revalidate = 604800;

export function generateStaticParams() {
  return CALCS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCalc(slug);
  if (!c) return {};
  return { title: c.title, description: c.description, alternates: { canonical: `/calculators/${c.slug}` } };
}

export default async function CalcPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCalc(slug);
  if (!c) notFound();

  const url = `${SITE.url}/calculators/${c.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", name: c.h1, url, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: c.description },
      { "@type": "FAQPage", mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <Container className="py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-muted">
        <Link href="/calculators" className="hover:text-accent">Calculators</Link>
      </nav>

      <Eyebrow className="mt-4">Calculators</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{c.h1}</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">{c.intro}</p>

      <div className="mt-8">
        {c.tool === "perdiem" && <PerDiemCalculator />}
        {c.tool === "mileage" && <MileageCalculator />}
        {c.tool === "mie" && <MieCalculator />}
        {c.tool === "trucker" && <TruckDriverCalculator />}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        {CALCS.filter((o) => o.slug !== c.slug).map((o) => (
          <Link key={o.slug} href={`/calculators/${o.slug}`} className="rounded-xl border border-line bg-surface px-3 py-1.5 text-ink-soft hover:border-accent/40 hover:shadow-sm">{o.h1}</Link>
        ))}
        <Link href="/methodology" className="rounded-xl border border-line bg-surface px-3 py-1.5 text-ink-soft hover:border-accent/40 hover:shadow-sm">How it&apos;s calculated</Link>
      </div>

      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">About the {c.h1.toLowerCase()}</h2>
        <div className="mt-4 space-y-4">
          {c.about.map((p, i) => (
            <p key={i} className="leading-relaxed text-ink-soft">{renderInline(p)}</p>
          ))}
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold text-ink sm:text-2xl">Frequently asked questions</h2>
        <div className="mt-4 space-y-4">
          {c.faq.map((f, i) => (
            <div key={i}>
              <h3 className="font-display text-base font-semibold text-ink">{f.q}</h3>
              <p className="mt-1 leading-relaxed text-ink-soft">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
