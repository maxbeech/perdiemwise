import Link from "next/link";
import type { ReactNode } from "react";

// Shared UI primitives — the single source of truth for layout + buttons +
// labels across the whole site. Reuse these instead of re-styling per page.

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

const BTN: Record<string, string> = {
  primary: "bg-accent text-white hover:bg-accent-dark shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(14,107,70,0.5)]",
  secondary: "bg-ink text-paper hover:bg-ink-soft",
  outline: "border border-line-strong bg-surface text-ink hover:border-ink/40 hover:bg-paper-2",
  ghost: "text-ink-soft hover:text-ink hover:bg-paper-2",
};
const SIZE: Record<string, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

export function Button({
  href, children, variant = "primary", size = "md", className = "", type, onClick, ...rest
}: {
  href?: string; children: ReactNode; variant?: keyof typeof BTN; size?: keyof typeof SIZE;
  className?: string; type?: "button" | "submit"; onClick?: () => void; [k: string]: unknown;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150 ${BTN[variant]} ${SIZE[size]} ${className}`;
  if (href) {
    const external = href.startsWith("http");
    return external
      ? <a href={href} className={cls} {...rest}>{children}</a>
      : <Link href={href} className={cls} {...rest}>{children}</Link>;
  }
  return <button type={type ?? "button"} onClick={onClick} className={cls} {...rest}>{children}</button>;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-accent ${className}`}>
      <span className="h-px w-6 bg-accent/50" aria-hidden />
      {children}
    </span>
  );
}

export function Badge({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "ink" | "clay" }) {
  const tones: Record<string, string> = {
    accent: "bg-accent-tint text-accent-dark",
    ink: "bg-ink/5 text-ink-soft",
    clay: "bg-clay/10 text-clay",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>;
}

/** Section heading block: eyebrow + serif title + optional lede. */
export function SectionHead({ eyebrow, title, lede, center = false }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; center?: boolean }) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {lede && <p className="mt-3 text-lg leading-relaxed text-muted">{lede}</p>}
    </div>
  );
}
