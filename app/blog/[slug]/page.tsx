import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost, type Block } from "@/lib/posts";
import { SITE } from "@/lib/site";
import { Container, Button, Eyebrow, Badge, Card } from "@/components/ui";

export const dynamicParams = false;
export const revalidate = 604800;

const DEFAULT_AUTHOR = "PerDiemWise Content Team";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  const url = `${SITE.url}/blog/${p.slug}`;
  const images = p.featuredImage ? [{ url: `${SITE.url}${p.featuredImage.src}`, width: 1260, height: 750, alt: p.featuredImage.alt }] : undefined;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.description,
      url,
      type: "article",
      publishedTime: p.date,
      authors: [p.author ?? DEFAULT_AUTHOR],
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: p.title,
      description: p.description,
      images: images?.map((i) => i.url),
    },
  };
}

function slugifyHeading(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Renders `[label](href)` markdown-style links inline within plain body text;
 *  internal hrefs (starting with "/") use next/link, external use a plain anchor. */
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

function renderBlock(b: Block, i: number) {
  switch (b.type) {
    case "h2":
      return <h2 key={i} id={slugifyHeading(b.text)} className="scroll-mt-24 font-display text-xl font-semibold text-ink sm:text-2xl">{b.text}</h2>;
    case "h3":
      return <h3 key={i} id={slugifyHeading(b.text)} className="scroll-mt-24 font-display text-lg font-semibold text-ink">{b.text}</h3>;
    case "ul":
      return (
        <ul key={i} className="list-disc space-y-1.5 pl-5 text-ink-soft">
          {b.items.map((it, j) => <li key={j} className="leading-relaxed">{renderInline(it)}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol key={i} className="list-decimal space-y-1.5 pl-5 text-ink-soft">
          {b.items.map((it, j) => <li key={j} className="leading-relaxed">{renderInline(it)}</li>)}
        </ol>
      );
    case "callout":
      return (
        <Card key={i} className="border-accent/30 bg-accent-tint p-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent-dark">{b.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{renderInline(b.text)}</p>
        </Card>
      );
    case "quote":
      return (
        <blockquote key={i} className="border-l-2 border-accent/50 pl-5 italic text-ink-soft">
          <p className="leading-relaxed">&ldquo;{b.text}&rdquo;</p>
          <cite className="mt-2 block font-mono text-xs not-italic text-muted">— {b.attribution}</cite>
        </blockquote>
      );
    case "table":
      return (
        <div key={i} className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">{b.caption}</caption>
            <thead className="bg-paper-2 text-left text-muted">
              <tr>{b.headers.map((h, j) => <th key={j} className="px-4 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((row, r) => (
                <tr key={r} className="border-t border-line">
                  {row.map((cell, c) => <td key={c} className="px-4 py-2 text-ink-soft">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line bg-paper-2 px-4 py-2 text-xs text-muted">{b.caption}</p>
        </div>
      );
    case "faq":
      return (
        <div key={i} className="space-y-4">
          {b.items.map((it, j) => (
            <div key={j}>
              <h3 className="font-display text-base font-semibold text-ink">{it.q}</h3>
              <p className="mt-1 leading-relaxed text-ink-soft">{renderInline(it.a)}</p>
            </div>
          ))}
        </div>
      );
    default:
      return <p key={i} className="leading-relaxed text-ink-soft">{renderInline(b.text)}</p>;
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();

  const author = p.author ?? DEFAULT_AUTHOR;
  const url = `${SITE.url}/blog/${p.slug}`;
  const imageUrl = p.featuredImage ? `${SITE.url}${p.featuredImage.src}` : undefined;
  const faqBlock = p.body.find((b): b is Extract<Block, { type: "faq" }> => b.type === "faq");
  const toc = p.body.filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2");

  const graph: Record<string, unknown>[] = [
    {
      "@type": p.schemaType === "HowTo" ? "HowTo" : "BlogPosting",
      "@id": `${url}#content`,
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.date,
      image: imageUrl,
      author: { "@type": "Organization", name: SITE.name, url: SITE.url },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
  ];
  if (faqBlock) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqBlock.items.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    });
  }
  if (p.schemaType === "Review" && p.review) {
    graph.push({
      "@type": "Review",
      "@id": `${url}#review`,
      itemReviewed: { "@type": p.review.itemType, name: p.review.itemName },
      reviewRating: { "@type": "Rating", ratingValue: p.review.ratingValue, bestRating: p.review.bestRating ?? 5 },
      author: { "@type": "Organization", name: SITE.name },
      datePublished: p.date,
    });
  }
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

  return (
    <Container className="py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-2xl">
        <nav className="text-sm text-muted">
          <Link href="/blog" className="hover:text-accent">Guides</Link>
        </nav>

        <Eyebrow className="mt-4">{p.category ?? "Guides"}</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{p.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-muted">
          <span>{author}</span>
          <span aria-hidden>·</span>
          <time dateTime={p.date}>{new Date(`${p.date}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time>
          <span aria-hidden>·</span>
          <span>{p.readMins} min read</span>
        </div>

        {p.featuredImage && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-line">
            <Image src={p.featuredImage.src} alt={p.featuredImage.alt} fill sizes="(min-width: 640px) 672px, 100vw" className="object-cover" priority />
          </div>
        )}
        {p.featuredImage && (
          <p className="mt-2 text-xs text-muted">
            {p.featuredImage.credit}{" "}
            <a href={p.featuredImage.creditUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">source</a>
          </p>
        )}

        {toc.length >= 4 && (
          <Card className="mt-8 p-5">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">In this guide</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {toc.map((h, i) => (
                <li key={i}>
                  <a href={`#${slugifyHeading(h.text)}`} className="text-ink-soft hover:text-accent">{h.text}</a>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="mt-8 space-y-5">
          {p.body.map((b, i) => renderBlock(b, i))}
        </div>

        {p.supportingKeywords && p.supportingKeywords.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {p.supportingKeywords.slice(0, 8).map((k) => <Badge key={k} tone="ink">{k}</Badge>)}
          </div>
        )}

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
