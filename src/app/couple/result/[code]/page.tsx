import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCoupleByCode } from "@/lib/db";
import { toPerson } from "@/lib/llm";
import { buildCoupleReport } from "@/lib/couple";
import Markdown from "@/components/Markdown";
import CopyLinkButton from "@/components/CopyLinkButton";

// 결과 코드가 노출되는 페이지 — 색인은 막는다 (코드를 아는 두 사람만).
export const metadata: Metadata = {
  title: "커플 궁합 결과",
  robots: { index: false, follow: false },
};

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-6">
      <p className="font-mono text-xs uppercase tracking-[2px] text-rose">{label}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function CoupleResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const couple = await getCoupleByCode(code);
  if (!couple) notFound();
  if (!couple.completed_at || !couple.b_birth_date) redirect(`/couple/join/${code}`);

  const a = toPerson(
    {
      name: couple.a_name,
      birth_date: couple.a_birth_date,
      birth_time: couple.a_birth_time,
      calendar: couple.a_calendar,
    },
    "A"
  );
  const b = toPerson(
    {
      name: couple.b_name,
      birth_date: couple.b_birth_date,
      birth_time: couple.b_birth_time,
      calendar: couple.b_calendar ?? "solar",
    },
    "B"
  );
  const report = buildCoupleReport(a, b);

  return (
    <div className="grid gap-5">
      <header className="text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-rose">couple saju</p>
        <h1 className="mt-2 text-3xl font-extrabold">
          {a.name} <span className="text-rose-deep">♥</span> {b.name}
        </h1>
        <p className="mt-4 text-6xl font-extrabold text-rose-deep">
          {report.chemistry.score}
          <span className="text-2xl">점</span>
        </p>
        <p className="mt-1 font-bold">
          {report.chemistry.label} · {report.chemistry.relationType}
        </p>
      </header>

      <Card label="궁합의 근거">
        <ul className="grid gap-2 text-sm leading-relaxed">
          {report.chemistry.reasons.length ? (
            report.chemistry.reasons.map((r) => (
              <li key={r} className="rounded-xl bg-cream p-3">
                {r}
              </li>
            ))
          ) : (
            <li className="rounded-xl bg-cream p-3">
              특별한 합도 충도 없는 담백한 조합 — 꾸준함으로 쌓아가는 관계입니다.
            </li>
          )}
        </ul>
      </Card>

      <Card label="스펙트럼 케미">
        <p className="leading-relaxed">
          {a.name}는 <strong className="text-rose-deep">{report.spectrumA.zone}</strong>,{" "}
          {b.name}는 <strong className="text-rose-deep">{report.spectrumB.zone}</strong>.
        </p>
      </Card>

      <Card label="싸울 때 매뉴얼">
        <ul className="grid gap-2 text-sm leading-relaxed">
          <li className="rounded-xl bg-cream p-3">
            <strong>{a.name}</strong>: {report.fight.a}
          </li>
          <li className="rounded-xl bg-cream p-3">
            <strong>{b.name}</strong>: {report.fight.b}
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed">{report.fight.note}</p>
      </Card>

      <Card label="먼저 연락하는 쪽">
        <p className="text-sm leading-relaxed">{report.contact.comment}</p>
      </Card>

      <Card label="동거(유홀) 지수">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-rose-deep">
            {report.cohabit.percent}%
          </span>
          <span className="font-mono text-xs text-rose">🚚 U-HAUL INDEX</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-cream">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sunset to-rose-deep"
            style={{ width: `${report.cohabit.percent}%` }}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed">
          먼저 부동산 앱을 켜는 쪽: <strong>{report.cohabit.mover}</strong>.{" "}
          {report.cohabit.comment}
        </p>
      </Card>

      <Card label="고양이 입양 예상">
        <p className="text-3xl">{report.cat.count > 0 ? "🐈".repeat(report.cat.count) : "🐈‍⬛?"}</p>
        <p className="mt-2 text-sm leading-relaxed">{report.cat.comment}</p>
      </Card>

      <Card label="좁은 판 경고">
        <p className="text-2xl font-extrabold text-rose-deep">
          전 애인의 전 애인일 확률 {report.smallWorld.percent}%
        </p>
        <p className="mt-2 text-sm leading-relaxed">{report.smallWorld.comment}</p>
      </Card>

      {couple.report && (
        <Card label="AI 심층 리포트">
          <Markdown>{couple.report}</Markdown>
        </Card>
      )}

      <div className="mt-2 grid gap-3 text-center">
        <CopyLinkButton />
        <Link href="/couple" className="text-sm font-semibold text-rose underline">
          다른 커플 궁합 만들기
        </Link>
        <p className="text-xs leading-relaxed text-rose">
          🔒 저장된 건 두 사람의 생년월일과 닉네임뿐이에요. 이 결과는 코드를 아는
          사람만 볼 수 있고, 초대는 이미 소진되어 다시 쓸 수 없어요.
        </p>
      </div>
    </div>
  );
}
