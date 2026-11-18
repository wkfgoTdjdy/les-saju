// 사이트 절대 URL — 메타데이터/공유 링크에서 공통 사용.
// 끝의 슬래시를 제거해 경로 조합 시 이중 슬래시를 방지한다.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

// Google Analytics 4 측정 ID
export const gaId = process.env.NEXT_PUBLIC_GA_ID ?? "G-5HDE1084FF";

// 복비(후원) 링크 — 결과 페이지 하단 복비함의 목적지.
// NEXT_PUBLIC_TIP_URL로 바꿀 수 있고, 빈 값("")으로 설정하면 복비함을 숨긴다.
export const tipUrl =
  (process.env.NEXT_PUBLIC_TIP_URL ?? "https://buymeacoffee.com/sia_dev") || null;
