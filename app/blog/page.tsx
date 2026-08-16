import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { POSTS } from "@/lib/posts";
import { Container, Eyebrow, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Per Diem & Mileage Guides",
  description: "Plain-English guides to per diem and mileage reimbursement: what per diem covers, the 75% rule, taxability, the 2026 IRS mileage rate and more.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <Container className="py-12 sm:py-16">
      <Eyebrow>Guides</Eyebrow>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Guides
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Everything you need to calculate, understand and defend a per diem or mileage claim.
      </p>
      <div className="mt-10 space-y-3">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="flex gap-5 rounded-2xl border border-line bg-surface p-5 transition hover:border-accent/40 hover:shadow-sm">
            {p.featuredImage && (
              <div className="relative hidden h-24 w-36 flex-none overflow-hidden rounded-xl border border-line sm:block">
                <Image src={p.featuredImage.src} alt={p.featuredImage.alt} fill sizes="144px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              {p.category && <Badge tone="accent">{p.category}</Badge>}
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
              <p className="mt-2 font-mono text-xs text-muted">{p.readMins} min read</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
