import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#0284c7", color: "white", fontSize: 40, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>P</div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#0f172a" }}>
            <span>PerDiem</span><span style={{ color: "#0284c7" }}>Wise</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 58, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, maxWidth: 980 }}>
          Free GSA per diem &amp; IRS mileage calculator
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#475569", maxWidth: 940 }}>
          Official FY2026 rates · the 75% first-and-last-day rule built in · itemised day by day.
        </div>
      </div>
    ),
    { ...size },
  );
}
