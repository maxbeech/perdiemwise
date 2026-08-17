"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Root-layout crash boundary. This REPLACES the entire <html> document when
 * app/layout.tsx itself throws, so it cannot rely on globals.css or any
 * component from the normal tree — inline styles only.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  async function reportFeedback() {
    const feedback = Sentry.getFeedback();
    const form = await feedback?.createForm();
    form?.appendToDom();
    form?.open();
  }

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "6rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.75rem", color: "#555" }}>
          PerDiemWise hit an unexpected error loading this page. It has been logged automatically.
        </p>
        <button
          onClick={reportFeedback}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1.25rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          Report this error
        </button>
      </body>
    </html>
  );
}
