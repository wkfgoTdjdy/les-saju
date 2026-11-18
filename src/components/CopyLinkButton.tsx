"use client";

import { useState } from "react";

/** 현재 결과 페이지 URL을 클립보드에 복사한다. */
export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없으면 조용히 무시 (주소창에서 직접 복사 가능)
    }
  }

  return (
    <button onClick={copy} className="btn-secondary">
      {copied ? "복사됐어요" : "결과 링크 복사하기"}
    </button>
  );
}
