import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          }}
        />

        {/* Right-side glow */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: 65,
            width: 500,
            height: 500,
            borderRadius: 250,
            backgroundImage:
              "radial-gradient(circle, rgba(15,176,133,0.18) 0%, rgba(15,176,133,0.05) 50%, transparent 75%)",
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
                border: "1.5px solid rgba(15,176,133,0.55)",
                borderRadius: 999,
                padding: "10px 26px",
                color: "#0FB085",
                fontSize: 19,
                letterSpacing: "0.06em",
                fontWeight: 500,
              }}
            >
              Free · AI-Powered · Instant
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              color: "#FDFAF5",
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              marginBottom: 24,
              maxWidth: 760,
            }}
          >
            Validate Before
            <br />
            You Build
          </div>

          {/* Supporting text */}
          <div
            style={{
              color: "#7EC850",
              fontSize: 31,
              fontWeight: 400,
              letterSpacing: "0.01em",
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
            gap: 10,
          }}
        >
          <div
            style={{
              color: "rgba(253,250,245,0.38)",
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.03em",
            }}
          >
            bizsproutai.com
          </div>
        </div>

        {/* Bottom-right subtle rule */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "rgba(15,176,133,0.15)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
