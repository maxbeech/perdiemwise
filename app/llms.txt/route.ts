import { CALCS } from "@/lib/calculators";
import { POSTS } from "@/lib/posts";
import { SITE } from "@/lib/site";
import { PRICING } from "@/lib/stripe";

// Machine-readable summary for LLM crawlers, see https://llmstxt.org.
export function GET() {
  const link = (path: string, text: string, note?: string) =>
    `- [${text}](${SITE.url}${path})${note ? `: ${note}` : ""}`;

  const body = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "PerDiemWise is a free web tool for U.S. business travel. It applies the official GSA per diem lodging and meals rates (including the 75% first-and-last-day rule) and the IRS standard mileage rate. The calculators are free. Pro keeps trips in a cloud ledger with compliant expense-report exports; Team adds a shared review workspace for bookkeepers and travel desks.",
    "",
    "## Tools",
    "",
    ...CALCS.map((c) => link(`/calculators/${c.slug}`, c.h1, c.description)),
    "",
    "## Rate reference",
    "",
    link("/per-diem", "Per diem rates by city", "GSA FY rates for every listed city"),
    link("/states", "Per diem rates by state", "State-by-state GSA rate tables"),
    link("/methodology", "Methodology", "How the rates are sourced and kept current"),
    "",
    "## Pricing",
    "",
    link("/pricing", "Plans and pricing"),
    `- Calculators: free`,
    `- Pro: ${PRICING.monthly.label} ${PRICING.monthly.per}, or ${PRICING.annual.label} ${PRICING.annual.per}`,
    `- Team: ${PRICING.teamMonthly.label} ${PRICING.teamMonthly.per}, or ${PRICING.teamAnnual.label} ${PRICING.teamAnnual.per}`,
    "",
    "## Guides",
    "",
    ...POSTS.map((p) => link(`/blog/${p.slug}`, p.title, p.description)),
    "",
    "## Site and data",
    "",
    link("/blog", "All guides"),
    `- [Sitemap](${SITE.url}/sitemap.xml)`,
    "- There is no public developer API. The /api routes serve the PerDiemWise application itself and are not documented for third-party use.",
    "",
    "## Contact",
    "",
    `- Email: ${SITE.email}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
