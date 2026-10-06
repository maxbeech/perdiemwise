import * as Sentry from "@sentry/nextjs";
import { IGNORED_ERROR_PATTERNS } from "@/lib/sentry-filters";
import { sharedSentryOptions } from "@/lib/sentry-options";

/**
 * Browser error reporting, loaded by Next at boot.
 *
 * The feedback integration backs the "Send feedback" control in the header and
 * footer (components/FeedbackButton.tsx), so a report from a person lands in
 * the same Sentry project as the exceptions from the code.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const shared = sharedSentryOptions();

if (dsn) {
  Sentry.init({
    dsn,
    ...shared,
    // See lib/sentry-filters.ts: known non-actionable browser noise (PERDIEMWISE_WEB-1).
    ignoreErrors: IGNORED_ERROR_PATTERNS,
    // Requests go through our own tunnel route (next.config.ts), so this is
    // same-origin. The header is required, not cosmetic: when a feedback report
    // includes a screenshot the browser sends the envelope as a raw ArrayBuffer
    // with NO Content-Type, the tunnel receives an empty body and the submit
    // silently fails. See getsentry/sentry-javascript#16112.
    transportOptions: {
      headers: { "content-type": "application/x-sentry-envelope" },
    },
    integrations: [
      ...shared.integrations,
      Sentry.feedbackIntegration({
        colorScheme: "system",
        // Opened by our own control; no floating Sentry button over the page.
        autoInject: false,
        showBranding: false,
        formTitle: "Send feedback",
        submitButtonLabel: "Send feedback",
        messagePlaceholder: "A bug, an idea, anything on your mind.",
        successMessageText: "Thank you. This has gone straight to us.",
      }),
    ],
  });
} else if (process.env.NODE_ENV === "production") {
  console.error("[sentry] NEXT_PUBLIC_SENTRY_DSN is not set: browser errors and feedback are not being reported.");
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
