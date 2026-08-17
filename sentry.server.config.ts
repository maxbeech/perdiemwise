import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  // Off by default: prod is the only place a real DSN is set, so the SDK is a
  // no-op locally unless a developer opts in.
  debug: false,
});
