import * as Sentry from "@sentry/nextjs";
import { IGNORED_ERROR_PATTERNS } from "@/lib/sentry-filters";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  // See lib/sentry-filters.ts: known non-actionable browser noise
  // (PERDIEMWISE_WEB-1), not an application bug.
  ignoreErrors: IGNORED_ERROR_PATTERNS,
  integrations: [
    // The injected control gives users a general feedback path; error boundaries
    // still open the same dialog with the associated Sentry event.
    Sentry.feedbackIntegration({
      autoInject: true,
      buttonLabel: "Feedback",
      formTitle: "Send feedback",
      submitButtonLabel: "Send feedback",
      colorScheme: "system",
    }),
  ],
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
