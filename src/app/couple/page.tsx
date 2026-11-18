import type { Metadata } from "next";
import CoupleForm from "@/components/CoupleForm";
import { usingMemoryStore } from "@/lib/db";

export const metadata: Metadata = {
  title: "레즈비언 커플 궁합 — 여자 커플 사주 궁합",
  description:
    "두 사람의 사주로 보는 레즈비언 커플 궁합. 초대 링크를 보내면 애인이 생일을 입력하는 순간 AI가 궁합을 풀어드립니다.",
  alternates: { canonical: "/couple" },
};

export default function CouplePage() {
  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <p className="label">커플 궁합</p>
        <h1 className="title text-[32px] leading-[1.2] sm:text-[40px]">
          우리, 사주로는 얼마나 잘 맞을까
        </h1>
        <p className="max-w-md leading-relaxed text-sub">
          오행 상생·상극으로 케미 점수를 계산하고, AI가 싸움 매뉴얼부터 고양이 입양
          예상까지 풀어드립니다. 커플 사주는 딱 1회 — 신중하게, 진심으로.
        </p>
      </section>

      {usingMemoryStore && (
        <p className="note text-seal">
          개발 모드: Supabase가 설정되지 않아 초대가 서버 재시작 시 사라져요.
        </p>
      )}

      <section className="card">
        <CoupleForm />
      </section>

      <p className="label">
        로그인 없이 쓸 수 있어요. 저장되는 건 두 사람의 생년월일과 닉네임뿐 — 결과는 랜덤
        코드를 아는 사람만 볼 수 있어요.
      </p>
    </div>
  );
}
