import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Per Diem & Mileage Guides",
  description: "Plain-English guides to per diem and mileage reimbursement: what per diem covers, the 75% rule, taxability, the 2026 IRS mileage rate and more.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-stone-900">Guides</h1>
      <p className="mt-2 max-w-2xl text-stone-600">Everything you need to calculate, understand and defend a per diem or mileage claim.</p>
      <div className="mt-8 space-y-3">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="block rounded-2xl border border-stone-200 bg-white p-5 hover:border-sky-300 hover:shadow-sm">
            <h2 className="font-bold text-stone-900">{p.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{p.description}</p>
            <p className="mt-2 text-xs text-stone-400">{p.readMins} min read</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
