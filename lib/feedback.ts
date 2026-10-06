/**
 * Opens Sentry's feedback form. Kept free of React and of a hard Sentry import
 * so the behaviour (pre-fill, tidy-up, "not configured" outcome) is unit-testable.
 */

export interface FeedbackUser {
  id?: string | null;
  email?: string | null;
  name?: string | null;
}

interface FeedbackForm {
  appendToDom(): void;
  open(): void;
}

export interface SentryFeedbackApi {
  getFeedback(): { createForm(overrides?: Record<string, unknown>): Promise<FeedbackForm> } | undefined;
  setUser(user: { id?: string; email?: string; username?: string } | null): void;
}

export type OpenFeedbackResult = "opened" | "unavailable";

/**
 * The form reads name and email from the Sentry user, so signed-in people do
 * not retype them. The identity is set only while the form is up: once it
 * closes or submits we go back to an id-only user, so the email never rides
 * along on later errors or logs.
 */
export async function openFeedback(sentry: SentryFeedbackApi, user?: FeedbackUser | null): Promise<OpenFeedbackResult> {
  const feedback = sentry.getFeedback();
  // No DSN on this deployment: tell the caller rather than doing nothing.
  if (!feedback) return "unavailable";

  const restore = () => sentry.setUser(user?.id ? { id: user.id } : null);
  if (user?.email) {
    sentry.setUser({
      ...(user.id ? { id: user.id } : {}),
      email: user.email,
      ...(user.name ? { username: user.name } : {}),
    });
  }
  const form = await feedback.createForm({ onFormClose: restore, onSubmitSuccess: restore });
  form.appendToDom();
  form.open();
  return "opened";
}
