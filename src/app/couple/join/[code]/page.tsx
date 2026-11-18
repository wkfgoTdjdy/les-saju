import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoupleByCode } from "@/lib/db";
import JoinCoupleForm from "@/components/JoinCoupleForm";
import WaitForCompletion from "@/components/WaitForCompletion";

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
      <div className="grid gap-4">
        <h1 className="title text-[28px] leading-[1.2]">이미 완성된 궁합이에요</h1>
        <p className="leading-relaxed text-sub">
          커플 사주는 초대 1건당 딱 한 번만 만들 수 있어요. 완성된 결과는 아래에서 볼 수
          있습니다.
        </p>
        <Link href={`/couple/result/${code}`} className="btn-primary justify-self-start">
          우리 궁합 결과 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <p className="label">커플 궁합 초대</p>
        <h1 className="title text-[32px] leading-[1.2]">
          <span className="text-accent">{inviter}</span>님이
          <br />
          커플 궁합을 신청했어요
        </h1>
        <p className="max-w-md leading-relaxed text-sub">
          당신의 생일을 입력하는 순간 AI가 두 사람의 사주를 풀어요. 이 초대는 딱 한 번만
          쓸 수 있어요.
        </p>
      </section>

      <section className="card">
        <JoinCoupleForm code={code} />
      </section>

      {/* 다른 기기에서 궁합이 완성되면 (예: 초대한 쪽이 열어둔 이 페이지) 자동으로 결과로 이동 */}
      <WaitForCompletion code={code} />
    </div>
  );
}
