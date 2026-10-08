import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WEEK3_POSTS } from "../lib/posts.ts";

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}\n    ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}

test("attaches primary, authoritative sources to every refreshed Week 3 guide", () => {
  assert.equal(WEEK3_POSTS.length, 15);
  for (const post of WEEK3_POSTS) {
    assert.ok(post.sources && post.sources.length >= 2, `${post.slug} needs at least two sources`);
    for (const source of post.sources) {
      assert.match(source.url, /^https:\/\/(?:www\.)?(?:gsa\.gov|irs\.gov|ecfr\.gov|allowances\.state\.gov)\//, `${post.slug}: ${source.url}`);
      assert.ok(source.label.trim().length > 0, `${post.slug} source needs a label`);
    }
  }
});

test("renders the source list accessibly after guide content", () => {
  const page = readFileSync("app/blog/[slug]/page.tsx", "utf8");
  assert.match(page, /aria-labelledby="sources-heading"/);
  assert.match(page, /rel="noopener noreferrer"/);
});

console.log(`\n${passed} content-source checks passed.`);
