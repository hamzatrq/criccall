import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CricCall — Predict Cricket. Win Rewards.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #15803d 0%, #14532d 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
            }}
          >
            🏏
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 900,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            CricCall
          </div>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.9)",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          Predict Cricket. Win Rewards.
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.6)",
            display: "flex",
            gap: "24px",
          }}
        >
          <span>Free to Play</span>
          <span>•</span>
          <span>Shariah Compliant</span>
          <span>•</span>
          <span>On-Chain on WireFluid</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          PSL 2026 — Live Prediction Markets
        </div>
      </div>
    ),
    { ...size }
  );
}
