import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "maxed-labs",
  project: "perdiemwise_web",
  // Source-map upload needs SENTRY_AUTH_TOKEN at build time; the build still
  // succeeds without it, just unsymbolicated.
  silent: true,
});
