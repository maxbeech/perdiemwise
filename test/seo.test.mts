import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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

const site = readFileSync("lib/site.ts", "utf8");
const config = readFileSync("next.config.ts", "utf8");
const sitemap = readFileSync("app/sitemap.ts", "utf8");
const robots = readFileSync("app/robots.ts", "utf8");

test("uses www as the immutable canonical origin", () => {
  assert.match(site, /export const CANONICAL_ORIGIN = "https:\/\/www\.perdiemwise\.com"/);
  assert.doesNotMatch(site, /NEXT_PUBLIC_SITE_URL/);
});

test("derives machine-readable SEO endpoints from the canonical origin", () => {
  assert.match(sitemap, /SITE\.url/);
  assert.match(robots, /sitemap: `\$\{SITE\.url\}\/sitemap\.xml`/);
  assert.match(robots, /host: SITE\.url/);
});

test("keeps generated Open Graph images out of the page index", () => {
  assert.match(config, /source: "\/opengraph-image"/);
  assert.match(config, /key: "X-Robots-Tag", value: "noindex"/);
});

console.log(`\n${passed} SEO checks passed.`);
