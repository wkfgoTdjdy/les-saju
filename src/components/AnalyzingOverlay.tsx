"use client";

import { useEffect, useState } from "react";

// 리포트가 실제로 다루는 항목들 — 기다리는 동안 무엇을 하고 있는지 보여준다
const STEPS = [
  "두 사람의 명식을 나란히 펼치는 중",
  "일간끼리 합이 드는지 맞춰보는 중",
  "오행 상생·상극을 따져보는 중",
  "싸울 때 매뉴얼을 쓰는 중",
  "동거지수를 계산하는 중",
  "고양이 입양 예상을 세는 중",
];

/** 커플 궁합 AI 분석 중 화면을 덮는 로딩. 분석은 보통 10~30초 걸린다. */
export default function AnalyzingOverlay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="analyzing-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-5"
    >
      <div className="card w-full max-w-sm shadow-[0_8px_24px_rgb(0_0_0/0.12)]">
        <h2 id="analyzing-title" className="title text-xl">
          궁합을 읽는 중
        </h2>
        <p key={step} aria-live="polite" className="analyzing-step mt-2 text-sm text-sub">
          {STEPS[step]}
        </p>
        <div className="meter mt-6">
          <div className="analyzing-bar" />
        </div>
        <p className="label mt-3">보통 10~30초 걸려요. 이 화면을 닫지 말고 기다려 주세요</p>
      </div>
    </div>
  );
}
