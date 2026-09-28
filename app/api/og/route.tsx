import { ImageResponse } from "next/og";
import { getLandingCopy } from "@/i18n/landingCopy";

export async function GET(request: Request) {
  const copy = getLandingCopy(
    new URL(request.url).searchParams.get("locale") ?? "en",
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "#0a0f1f",
        color: "#f8fafc",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 26,
          color: "#6ee7b7",
        }}
      >
        <span>BizSproutAI</span>
        <span>validate.bizsproutai.com</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 26, color: "#cbd5e1" }}>{copy.eyebrow}</div>
        <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>
          {copy.title}
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#6ee7b7",
          }}
        >
          {copy.accent}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "#a5f3fc" }}>{copy.primary} →</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
