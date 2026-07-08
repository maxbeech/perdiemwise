import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { getAccount } from "@/lib/account";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to PerDiemWise to sync your trips across devices and export IRS/GSA expense reports.",
  robots: { index: false },
  alternates: { canonical: "/login" },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const account = await getAccount();
  const target = next && next.startsWith("/") ? next : "/account";
  if (account) redirect(target);

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Sign in to PerDiemWise</h1>
          <p className="mt-3 text-muted">Sync trips across devices, export expense reports, and manage your Pro plan.</p>
        </div>
        {error === "link" && (
          <p className="mt-6 rounded-xl bg-clay/10 px-4 py-3 text-center text-sm text-clay">That sign-in link expired or was already used. Enter your email to get a fresh one.</p>
        )}
        <div className="mt-8">
          <LoginForm next={target} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          The calculators are free and need no account. <Link href="/calculators/per-diem-calculator" className="text-accent hover:underline">Start calculating →</Link>
        </p>
      </div>
    </Container>
  );
}
