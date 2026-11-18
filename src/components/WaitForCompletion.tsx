"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 커플 완성 여부를 주기적으로 확인하다가, 상대방이 입력을 마치면
 * 자동으로 결과 페이지로 이동한다. (초대 만든 쪽 / join 페이지 양쪽에서 사용)
 */
export default function WaitForCompletion({
  code,
  message,
}: {
  code: string;
  message?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/couples/${code}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.completed && !stopped) {
          stopped = true;
          clearInterval(timer);
          router.push(`/couple/result/${code}`);
        }
      } catch {
        // 네트워크 일시 오류 — 다음 폴링에서 재시도
      }
    }, 3000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [code, router]);

  if (!message) return null;
  return (
    <p className="label flex items-center gap-2">
      {/* 실제로 3초마다 확인 중이라는 표시 — 살아 있는 상태에만 쓰는 점 */}
      <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" />
      {message}
    </p>
  );
}
