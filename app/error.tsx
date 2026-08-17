"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Route-segment error boundary. Every error here is already captured by
 * Sentry automatically (via onRequestError / the SDK's error listeners) —
 * the explicit captureException just guarantees it even if that path
 * changes, and gives us the event id to attach the user's optional report to.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [reportOpened, setReportOpened] = useState(false);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  async function reportFeedback() {
    const feedback = Sentry.getFeedback();
    const form = await feedback?.createForm();
    form?.appendToDom();
    form?.open();
    setReportOpened(true);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink-soft">
        This page hit an unexpected error. It has already been logged — reporting is only useful if you want to
        add what you were doing when it happened.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
        <button
          onClick={reportFeedback}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:bg-paper-2"
        >
          {reportOpened ? "Report opened" : "Report this error"}
        </button>
      </div>
    </div>
  );
}
