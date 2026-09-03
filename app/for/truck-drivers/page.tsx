import type { Metadata } from "next";
import Link from "next/link";
import TruckDriverCalculator from "@/components/TruckDriverCalculator";
import { Container, Eyebrow } from "@/components/ui";
import { TRANSPORTATION_PER_DIEM } from "@/lib/truckers";

export const revalidate = 604800;
export const metadata: Metadata = { title: "Truck Driver Per Diem Calculator", description: "Track the IRS special transportation-industry per diem for DOT-regulated truck drivers: $80 CONUS / $86 OCONUS and 80% deductible.", alternates: { canonical: "/for/truck-drivers" } };

export default function TruckDriversPage() {
  return <Container className="py-12 sm:py-16"><div className="mx-auto max-w-5xl"><Link href="/calculators" className="text-sm text-muted hover:text-accent">Calculators</Link><div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"><div><Eyebrow>For truck drivers</Eyebrow><h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">A running per-diem log built around the road.</h1><p className="mt-5 text-lg leading-relaxed text-muted">Use the IRS special transportation rate for qualifying days away from home, then keep the record in your Pro account for tax-time review. No GSA lookup, no spreadsheet math.</p><div className="mt-7 grid grid-cols-3 gap-4 border-y border-line py-5"><div><p className="tnum text-2xl font-semibold text-ink">$80</p><p className="text-xs text-muted">CONUS / day</p></div><div><p className="tnum text-2xl font-semibold text-ink">$86</p><p className="text-xs text-muted">OCONUS / day</p></div><div><p className="tnum text-2xl font-semibold text-accent-dark">80%</p><p className="text-xs text-muted">deductible</p></div></div><p className="mt-5 text-sm leading-relaxed text-muted">Verified period: {TRANSPORTATION_PER_DIEM.effectiveFrom} through {TRANSPORTATION_PER_DIEM.effectiveThrough}. You must meet the DOT hours-of-service qualification and keep supporting records. <a className="text-accent underline" href={TRANSPORTATION_PER_DIEM.source} target="_blank" rel="noreferrer">Read the IRS notice</a>.</p></div><TruckDriverCalculator /></div></div></Container>;
}
