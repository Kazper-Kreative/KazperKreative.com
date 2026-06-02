import { ImageResponse } from "next/og";

// Branded social share card, generated at build/edge. Applies as the
// default og:image (and, via re-export, twitter:image) for every route.
export const alt = "Kazper Kreative · Agency × Game Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px",
          background: "#07070C",
          backgroundImage:
            "radial-gradient(900px 600px at 80% -10%, rgba(123,63,242,0.35), transparent 60%), radial-gradient(800px 500px at 0% 110%, rgba(255,46,132,0.28), transparent 60%)",
          color: "#ECEDF4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            color: "#9B9CB0",
            textTransform: "uppercase",
          }}
        >
          Agency × Game Studio
        </div>
        <div style={{ fontSize: 104, fontWeight: 700, marginTop: 20, lineHeight: 1 }}>
          Kazper Kreative
        </div>
        <div style={{ fontSize: 36, color: "#9B9CB0", marginTop: 28, maxWidth: 940 }}>
          We build worlds, brands &amp; the people behind them.
        </div>
        <div
          style={{
            marginTop: 52,
            height: 14,
            width: 460,
            borderRadius: 999,
            background:
              "linear-gradient(110deg, #FF5A2C, #FF2E84, #B931FF, #7B3FF2, #FFC042)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
