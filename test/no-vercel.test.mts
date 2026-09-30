import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// PerDiemWise runs on Helm7, not Vercel. Anything that names Vercel either does
// nothing there or silently changes behaviour: a `VERCEL` env check is always
// unset so the branch it guards is dead, and `x-vercel-*` headers are absent.
// Files marked GENERATED are copies of the shared service clients; their
// canonical source is edited elsewhere, so they are not policed here.

const ROOTS = ["app", "components", "lib"];
const TOP_LEVEL = [
  "next.config.ts",
  "proxy.ts",
  "instrumentation.ts",
  "instrumentation-client.ts",
  "sentry.server.config.ts",
  "sentry.edge.config.ts",
  "eslint.config.mjs",
];

function sourceFiles(dir: string, found: string[] = []): string[] {
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) sourceFiles(p, found);
    else if (/\.(ts|tsx|mts|mjs)$/.test(entry)) found.push(p);
  }
  return found;
}

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e instanceof Error ? e.message : e}`);
    process.exitCode = 1;
  }
}

const files = [...ROOTS.flatMap((r) => sourceFiles(r)), ...TOP_LEVEL.filter(existsSync)].filter(
  (f) => !/GENERATED/.test(readFileSync(f, "utf8").slice(0, 400)),
);
const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

test("finds the source to police", () => {
  assert.ok(files.length > 30, `only ${files.length} files found`);
});

test("names Vercel nowhere in application code", () => {
  const offenders = files.filter((f) => /vercel/i.test(readFileSync(f, "utf8")));
  assert.deepEqual(offenders, [], `These mention Vercel: ${offenders.join(", ")}`);
});

test("sets no maxDuration, which only Vercel reads", () => {
  const offenders = files.filter((f) => /export const maxDuration/.test(readFileSync(f, "utf8")));
  assert.deepEqual(offenders, []);
});

test("has no Vercel package, CLI script or vercel.json", () => {
  const packages = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter(
    (n) => n === "vercel" || n === "botid" || n.startsWith("@vercel/"),
  );
  assert.deepEqual(packages, []);
  const scripts = Object.entries(pkg.scripts ?? {}).filter(([, cmd]) => /(^|[\s&;|])vercel(\s|$)/.test(cmd));
  assert.deepEqual(scripts, []);
  assert.equal(existsSync("vercel.json"), false);
});

test("starts on the port Helm7 assigns", () => {
  // `next start` reads PORT; a hard-coded -p would leave the health check
  // probing a port nothing listens on.
  const start = pkg.scripts?.start ?? "";
  assert.ok(!/(^|\s)(-p|--port)\b/.test(start) || start.includes("${PORT"), `start is "${start}"`);
});

test("the site URL fallback is the production origin", () => {
  const site = readFileSync("lib/site.ts", "utf8");
  assert.ok(site.includes("https://www.perdiemwise.com"));
});

console.log(`\n${passed} no-vercel checks passed.`);
