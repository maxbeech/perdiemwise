import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/lib/posts";
import { SITE } from "@/lib/site";

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
    <article className="mx-auto max-w-2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-stone-500"><Link href="/blog" className="hover:text-sky-700">Guides</Link></nav>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">{p.title}</h1>
      <p className="mt-2 text-sm text-stone-400">{p.readMins} min read</p>
      <div className="mt-6 space-y-4">
        {p.body.map((b, i) => {
          if (b.type === "h2") return <h2 key={i} className="text-xl font-bold text-stone-900">{b.text}</h2>;
          if (b.type === "ul") return <ul key={i} className="list-disc space-y-1 pl-5 text-stone-700">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
          return <p key={i} className="leading-relaxed text-stone-700">{b.text}</p>;
        })}
      </div>
      <div className="mt-10 rounded-2xl border border-sky-200 bg-sky-50 p-5">
        <h2 className="font-bold text-stone-900">Calculate it now</h2>
        <p className="mt-1 text-sm text-stone-600">Use the free GSA per diem and IRS mileage calculators.</p>
        <div className="mt-3 flex gap-3 text-sm">
          <Link href="/calculators/per-diem-calculator" className="rounded-lg bg-sky-600 px-3 py-1.5 font-medium text-white hover:bg-sky-500">Per diem calculator</Link>
          <Link href="/calculators/mileage-reimbursement-calculator" className="rounded-lg border border-sky-300 px-3 py-1.5 font-medium text-sky-700 hover:bg-white">Mileage calculator</Link>
        </div>
      </div>
    </article>
  );
}
