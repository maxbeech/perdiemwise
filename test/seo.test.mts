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

test("names the AI crawlers explicitly and welcomes them", () => {
  for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"]) {
    assert.ok(robots.includes(`"${bot}"`), `robots.ts does not name ${bot}`);
  }
  assert.match(robots, /\{ userAgent: "\*", allow: "\/" \}/);
});

test("serves llms.txt generated from the same calculator, guide, site and price data", () => {
  const llms = readFileSync("app/llms.txt/route.ts", "utf8");
  assert.match(llms, /from "@\/lib\/calculators"/);
  assert.match(llms, /from "@\/lib\/posts"/);
  assert.match(llms, /PRICING\.monthly\.label/);
  assert.match(llms, /Content-Type": "text\/plain; charset=utf-8"/);
});

test("pricing page emits Offers from the same PRICING source the UI renders", () => {
  const pricing = readFileSync("app/pricing/page.tsx", "utf8");
  assert.match(pricing, /"@type": "SoftwareApplication"/);
  assert.match(pricing, /offer\("PerDiemWise Pro \(monthly\)", PRICING\.monthly\.amount, "MON"\)/);
  assert.match(pricing, /offer\("PerDiemWise Team \(annual\)", PRICING\.teamAnnual\.amount, "ANN"\)/);
});

test("deep calculator and state pages emit a BreadcrumbList matching their visible navigation", () => {
  const calc = readFileSync("app/calculators/[slug]/page.tsx", "utf8");
  const state = readFileSync("app/states/[state]/page.tsx", "utf8");
  assert.match(calc, /"@type": "BreadcrumbList"/);
  assert.match(calc, /name: "Calculators"/);
  assert.match(state, /"@type": "BreadcrumbList"/);
  assert.match(state, /name: "By state"/);
});

test("home page emits Organization and WebSite entities", () => {
  const home = readFileSync("app/page.tsx", "utf8");
  assert.match(home, /"@type": "Organization"/);
  assert.match(home, /"@type": "WebSite"/);
});

console.log(`\n${passed} SEO checks passed.`);
