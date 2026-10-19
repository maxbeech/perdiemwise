import { POSTS, type Post } from "@/lib/posts";

const STOP = new Set(["the", "a", "an", "of", "to", "for", "and", "in", "is", "vs", "how", "what", "are", "from", "explained", "guide", "compared", "2026"]);

function tokens(p: Post): Set<string> {
  return new Set(`${p.slug} ${p.keyword}`.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t)));
}

/** Posts most related to `slug` by shared slug/keyword terms. Posts that no
 *  other guide has picked yet are favoured on ties so every guide gets
 *  internal links from related pages. */
export function relatedPosts(slug: string, limit = 4): Post[] {
  const me = POSTS.find((p) => p.slug === slug);
  if (!me) return [];
  const mine = tokens(me);
  return POSTS.filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      for (const t of tokens(p)) if (mine.has(t)) score += 1;
      if (p.category && p.category === me.category) score += 0.5;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.p);
}
