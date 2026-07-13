import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoupleByCode } from "@/lib/db";
import JoinCoupleForm from "@/components/JoinCoupleForm";

// 초대 코드가 노출되는 페이지 — 색인은 막는다.
export const metadata: Metadata = {
  title: "커플 궁합 초대",
  robots: { index: false, follow: false },
};

export default async function JoinCouplePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const couple = await getCoupleByCode(code);
  if (!couple) notFound();

  const inviter = couple.a_name ?? "누군가";

  if (couple.completed_at) {
    return (
      <div className="grid gap-4 text-center">
        <p className="text-4xl">💌</p>
        <h1 className="text-2xl font-extrabold">이미 완성된 궁합이에요</h1>
        <p className="text-sm leading-relaxed text-rose">
          커플 사주는 초대 1건당 딱 한 번만 만들 수 있어요.
          <br />
          완성된 결과는 아래에서 볼 수 있습니다.
        </p>
        <Link
          href={`/couple/result/${code}`}
          className="mx-auto rounded-xl bg-gradient-to-r from-sunset via-rose-soft to-rose-deep px-6 py-3 font-extrabold text-white transition hover:opacity-90"
        >
          우리 궁합 결과 보기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-3 text-center">
        <p className="text-4xl">💌</p>
        <h1 className="text-3xl font-extrabold">
          <span className="text-rose-deep">{inviter}</span>님이
          <br />
          커플 궁합을 신청했어요
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-rose">
          당신의 생일을 입력하는 순간 AI가 두 사람의 사주를 풀어요.
          <br />이 초대는 <strong>딱 한 번</strong>만 쓸 수 있어요.
        </p>
      </section>

      <section className="mx-auto w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-sm">
        <JoinCoupleForm code={code} />
      </section>
    </div>
  );
}
