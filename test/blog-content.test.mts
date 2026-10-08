import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { POSTS, WEEK3_POSTS, type Block } from "../lib/posts";

function blockText(block: Block): string[] {
  if (block.type === "ul" || block.type === "ol") return block.items;
  if (block.type === "faq") return block.items.flatMap((item) => [item.q, item.a]);
  if (block.type === "table") return [block.caption, ...block.headers, ...block.rows.flat()];
  if (block.type === "quote") return [block.text, block.attribution];
  if (block.type === "callout") return [block.title, block.text];
  return [block.text];
}

function wordCount(post: (typeof WEEK3_POSTS)[number]) {
  const text = post.body.flatMap(blockText).join(" ");
  return text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
}

assert.equal(WEEK3_POSTS.length, 15, "the October publication batch must contain 15 posts");
assert.equal(new Set(POSTS.map((post) => post.slug)).size, POSTS.length, "blog slugs must be unique");

for (const post of WEEK3_POSTS) {
  assert.ok(POSTS.includes(post), `${post.slug} must be registered in the blog source of truth`);
  assert.ok(post.title.length < 60, `${post.slug}: title must be under 60 characters`);
  assert.ok(post.description.length < 155, `${post.slug}: description must be under 155 characters`);
  assert.ok((post.supportingKeywords?.length ?? 0) >= 6 && (post.supportingKeywords?.length ?? 0) <= 12, `${post.slug}: needs 6–12 supporting keywords`);
  assert.ok((post.longTailPhrases?.length ?? 0) >= 2 && (post.longTailPhrases?.length ?? 0) <= 4, `${post.slug}: needs 2–4 long-tail phrases`);
  assert.match(post.date, /^2026-10-0[1-7]$/, `${post.slug}: must be dated within the publication week`);
  assert.ok(wordCount(post) >= 1_200 && wordCount(post) <= 2_500, `${post.slug}: body must be 1,200–2,500 words`);
  assert.ok(post.body.some((block) => block.type === "table"), `${post.slug}: needs a table or chart`);
  assert.ok(post.body.some((block) => block.type === "quote"), `${post.slug}: needs an expert quote`);
  const faq = post.body.find((block) => block.type === "faq");
  assert.ok(faq && faq.items.length >= 3 && faq.items.length <= 5, `${post.slug}: needs 3–5 FAQs`);
  const internalLinks = (JSON.stringify(post.body).match(/\]\(\//g) ?? []).length;
  assert.ok(internalLinks >= 3, `${post.slug}: needs at least three internal links`);
  assert.ok(post.featuredImage, `${post.slug}: needs a featured image`);
  assert.ok(existsSync(path.join(process.cwd(), "public", post.featuredImage!.src.replace(/^\//, ""))), `${post.slug}: featured image must exist`);
  assert.ok(post.featuredImage!.alt.toLowerCase().includes(post.keyword.toLowerCase()), `${post.slug}: alt text must include the primary keyword`);
  assert.equal(post.sources?.length, 2, `${post.slug}: needs two official external sources`);
  for (const source of post.sources ?? []) {
    assert.match(new URL(source.url).hostname, /(?:\.gov|\.mil)$/, `${post.slug}: source must be an official authority`);
  }
}

console.log(`Validated ${WEEK3_POSTS.length} publication-ready posts and their blog registry contract.`);
