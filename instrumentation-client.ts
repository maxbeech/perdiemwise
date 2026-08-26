import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
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
