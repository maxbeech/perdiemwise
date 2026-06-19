import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px", background: "#faf8f2", backgroundImage: "radial-gradient(900px 360px at 85% -10%, rgba(24,160,106,0.12), transparent 60%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#0e6b46", color: "#faf8f2", fontSize: 34, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>P</div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#181712" }}><span>PerDiem</span><span style={{ color: "#0e6b46" }}>Wise</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#181712", lineHeight: 1.05, maxWidth: 1000, letterSpacing: "-0.02em" }}>Per diem &amp; mileage, calculated correctly.</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 27, color: "#6f6a5c", maxWidth: 940 }}>Official GSA FY2026 &amp; IRS 2026 rates · the 75% first-and-last-day rule built in.</div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 20, color: "#6f6a5c" }}>
          <span>298 GSA cities</span><span>·</span><span>50 states + DC</span><span>·</span><span>Free to use</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
