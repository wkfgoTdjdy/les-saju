import type { Metadata } from "next";
import CoupleForm from "@/components/CoupleForm";
import { usingMemoryStore } from "@/lib/db";

export const metadata: Metadata = {
  title: "커플 궁합",
  description:
    "두 사람의 사주로 보는 레즈비언 커플 궁합. 초대 링크를 보내면 애인이 생일을 입력하는 순간 AI가 궁합을 풀어드립니다.",
  alternates: { canonical: "/couple" },
};

export default function CouplePage() {
  return (
    <div className="grid gap-8">
      <section className="grid gap-3 text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-rose">couple saju</p>
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          우리, 사주로는{" "}
          <span className="bg-gradient-to-r from-sunset-deep via-rose-soft to-rose-deep bg-clip-text text-transparent">
            얼마나 잘 맞을까
          </span>
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-rose">
          오행 상생·상극으로 케미 점수를 계산하고, AI가 싸움 매뉴얼부터 고양이 입양
          예상까지 풀어드립니다. 커플 사주는 <strong>딱 1회</strong> — 신중하게, 진심으로.
        </p>
      </section>

      {usingMemoryStore && (
        <p className="mx-auto max-w-md rounded-xl border border-sunset bg-card p-3 text-center text-xs font-semibold text-sunset-deep">
          ⚠️ 개발 모드: Supabase가 설정되지 않아 초대가 서버 재시작 시 사라져요.
        </p>
      )}

      <section className="mx-auto w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-sm">
        <CoupleForm />
      </section>

      <p className="text-center text-xs leading-relaxed text-rose">
        🔒 로그인 없이 쓸 수 있어요. 저장되는 건 두 사람의 생년월일과 닉네임뿐 —
        결과는 랜덤 코드를 아는 사람만 볼 수 있어요.
      </p>
    </div>
  );
}
