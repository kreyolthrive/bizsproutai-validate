import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            backgroundColor: "#0f1f17",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              backgroundColor: "#0FB085",
              display: "flex",
            }}
          />

          {/* Right-side glow — solid circle, no gradient (Satori-safe) */}
          <div
            style={{
              position: "absolute",
              right: -140,
              top: 90,
              width: 450,
              height: 450,
              borderRadius: 225,
              backgroundColor: "rgba(15,176,133,0.07)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -60,
              top: 140,
              width: 320,
              height: 320,
              borderRadius: 160,
              backgroundColor: "rgba(15,176,133,0.06)",
              display: "flex",
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              padding: "64px 88px",
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: "flex",
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid rgba(15,176,133,0.5)",
                  borderRadius: 999,
                  padding: "10px 26px",
                  color: "#0FB085",
                  fontSize: 19,
                  letterSpacing: "0.06em",
                }}
              >
                Free · AI-Powered · Instant
              </div>
            </div>

            {/* Headline */}
            <div
              style={{
                color: "#FDFAF5",
                fontSize: 82,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: 24,
                maxWidth: 760,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Validate Before</span>
              <span>You Build</span>
            </div>

            {/* Supporting text */}
            <div
              style={{
                color: "#7EC850",
                fontSize: 31,
                letterSpacing: "0.01em",
                display: "flex",
              }}
            >
              From idea to first customer
            </div>
          </div>

          {/* Bottom branding */}
          <div
            style={{
              position: "absolute",
              bottom: 48,
              left: 88,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                color: "rgba(253,250,245,0.35)",
                fontSize: 20,
                letterSpacing: "0.04em",
                display: "flex",
              }}
            >
              bizsproutai.com
            </div>
          </div>

          {/* Bottom rule */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: "rgba(15,176,133,0.12)",
              display: "flex",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[og] ImageResponse failed:", message);
    return new Response(`OG image generation failed: ${message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
