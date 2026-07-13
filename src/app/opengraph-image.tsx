import { ImageResponse } from "next/og";

export const alt = "LES SAJU — 레즈비언 전용 사주 · 커플 궁합";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 한글 폰트 파일 없이도 깨지지 않도록 라틴 텍스트만 사용한 선셋 그라디언트 OG 이미지
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #d52d00 0%, #ef7627 25%, #ff9a56 45%, #d162a4 70%, #a30262 100%)",
          padding: "70px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 8, opacity: 0.95 }}>
          FOR LESBIANS, BY DESTINY
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 170,
            fontWeight: 900,
            lineHeight: 1.02,
            textShadow: "0 4px 24px rgba(71,16,47,0.35)",
          }}
        >
          <span>LES</span>
          <span>SAJU</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 30,
            letterSpacing: 4,
            opacity: 0.95,
          }}
        >
          <span>LESBIAN SAJU × COUPLE CHEMISTRY</span>
          <span>🌈</span>
        </div>
      </div>
    ),
    size
  );
}
