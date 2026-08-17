import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  integrations: [
    // Not a floating widget — only shown when a user deliberately clicks
    // "Report this error" from app/error.tsx or app/global-error.tsx.
    Sentry.feedbackIntegration({ autoInject: false, colorScheme: "system" }),
  ],
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
