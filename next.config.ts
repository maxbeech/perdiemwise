import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "maxed-labs",
  project: process.env.SENTRY_PROJECT || "perdiemwise_web",
  // Source-map upload needs SENTRY_AUTH_TOKEN at build time; the build still
  // succeeds without it, just unsymbolicated.
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Route browser requests through our own domain so an ad blocker does not
  // drop the reports we depend on. `true` picks a random path per build: a
  // fixed "/monitoring" is on ad-blocker lists.
  tunnelRoute: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
});
