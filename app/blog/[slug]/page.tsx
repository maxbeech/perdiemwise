import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/lib/posts";
import { SITE } from "@/lib/site";
import { Container, Button, Eyebrow } from "@/components/ui";

export const dynamicParams = false;
export const revalidate = 604800;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return { title: p.title, description: p.description, alternates: { canonical: `/blog/${p.slug}` } };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
  };

  return (
    <Container className="py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-2xl">
        <nav className="text-sm text-muted">
          <Link href="/blog" className="hover:text-accent">Guides</Link>
        </nav>

        <Eyebrow className="mt-4">Guides</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{p.title}</h1>
        <p className="mt-2 font-mono text-sm text-muted">{p.readMins} min read</p>

        <div className="mt-8 space-y-5">
          {p.body.map((b, i) => {
            if (b.type === "h2") return (
              <h2 key={i} className="font-display text-xl font-semibold text-ink">{b.text}</h2>
            );
            if (b.type === "ul") return (
              <ul key={i} className="list-disc space-y-1.5 pl-5 text-ink-soft">
                {b.items.map((it, j) => <li key={j} className="leading-relaxed">{it}</li>)}
              </ul>
            );
            return <p key={i} className="leading-relaxed text-ink-soft">{b.text}</p>;
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-accent/30 bg-accent-tint p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Calculate it now</h2>
          <p className="mt-2 text-sm text-ink-soft">Use the free GSA per diem and IRS mileage calculators.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/calculators/per-diem-calculator" size="sm">Per diem calculator</Button>
            <Button href="/calculators/mileage-reimbursement-calculator" variant="outline" size="sm">Mileage calculator</Button>
          </div>
        </div>
      </article>
    </Container>
  );
}
