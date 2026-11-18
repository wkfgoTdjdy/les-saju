import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCoupleByCode } from "@/lib/db";
import { toPerson } from "@/lib/llm";
import { buildCoupleReport } from "@/lib/couple";
import Markdown from "@/components/Markdown";
import CopyLinkButton from "@/components/CopyLinkButton";
import TipJar from "@/components/TipJar";
import SajuChart from "@/components/SajuChart";

// 결과 코드가 노출되는 페이지 — 색인은 막는다 (코드를 아는 두 사람만).
export const metadata: Metadata = {
  title: "커플 궁합 결과",
  robots: { index: false, follow: false },
};

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <p className="label">{label}</p>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Percent({ value, comment }: { value: number; comment: React.ReactNode }) {
  return (
    <>
      <p className="figure mt-3">{value}%</p>
      <div className="meter mt-4">
        <div style={{ width: `${value}%` }} />
      </div>
      <p className="mt-4 text-sm leading-relaxed">{comment}</p>
    </>
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
    <div className="grid gap-4">
      <header className="mb-4 grid gap-6">
        <div className="grid gap-2">
          <p className="label">커플 궁합</p>
          <h1 className="title text-[32px] leading-[1.2] sm:text-[40px]">
            {a.name} <span className="text-accent">♥</span> {b.name}
          </h1>
        </div>
        <div className="flex items-baseline gap-4">
          <p className="font-serif text-[72px] leading-none font-medium tabular-nums text-accent">
            {report.chemistry.score}
            <span className="text-2xl">점</span>
          </p>
          <p className="font-medium">
            {report.chemistry.label} · {report.chemistry.relationType}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SajuChart saju={a.saju} caption={a.name} />
          <SajuChart saju={b.saju} caption={b.name} />
        </div>
      </header>

      <Card label="궁합의 근거">
        <ul className="rows mt-3 text-sm leading-relaxed">
          {report.chemistry.reasons.length ? (
            report.chemistry.reasons.map((r) => <li key={r}>{r}</li>)
          ) : (
            <li>특별한 합도 충도 없는 담백한 조합 — 꾸준함으로 쌓아가는 관계입니다.</li>
          )}
        </ul>
      </Card>

      <Card label="스펙트럼 케미">
        <p className="mt-3 leading-relaxed">
          {a.name}는 <span className="font-medium text-accent">{report.spectrumA.zone}</span>,{" "}
          {b.name}는 <span className="font-medium text-accent">{report.spectrumB.zone}</span>.
        </p>
      </Card>

      <Card label="싸울 때 매뉴얼">
        <dl className="rows mt-3 text-sm leading-relaxed">
          <div>
            <dt className="font-medium">{a.name}</dt>
            <dd className="mt-1">{report.fight.a}</dd>
          </div>
          <div>
            <dt className="font-medium">{b.name}</dt>
            <dd className="mt-1">{report.fight.b}</dd>
          </div>
        </dl>
        <p className="note mt-4">{report.fight.note}</p>
      </Card>

      <Card label="먼저 연락하는 쪽">
        <p className="mt-3 text-sm leading-relaxed">{report.contact.comment}</p>
      </Card>

      <Card label="동거지수 · 함께 살 확률">
        <Percent
          value={report.cohabit.percent}
          comment={
            <>
              먼저 부동산 앱을 켜는 쪽:{" "}
              <span className="font-medium">{report.cohabit.mover}</span>.{" "}
              {report.cohabit.comment}
            </>
          }
        />
      </Card>

      <Card label="둘이 만나면 트이는 금전운">
        <Percent value={report.wealth.percent} comment={report.wealth.comment} />
      </Card>

      <Card label="둘이 만나면 트이는 성공운">
        <Percent value={report.success.percent} comment={report.success.comment} />
      </Card>

      <Card label="여행 케미">
        <p className="mt-3 text-sm leading-relaxed">{report.travel.comment}</p>
      </Card>

      <Card label="고양이 입양 예상">
        <p className="mt-3 text-3xl">
          {report.cat.count > 0 ? "🐈".repeat(report.cat.count) : "🐈‍⬛?"}
        </p>
        <p className="mt-3 text-sm leading-relaxed">{report.cat.comment}</p>
      </Card>

      {couple.report && (
        <Card label="AI 심층 리포트">
          <div className="mt-3">
            <Markdown>{couple.report}</Markdown>
          </div>
        </Card>
      )}

      <TipJar />

      <div className="mt-4 grid gap-4">
        <CopyLinkButton />
        <p className="label">
          저장된 건 두 사람의 생년월일과 닉네임뿐이에요. 이 결과는 코드를 아는 사람만 볼
          수 있고, 초대는 이미 소진되어 다시 쓸 수 없어요.{" "}
          <Link href="/couple" className="text-link">
            다른 커플 궁합 만들기
          </Link>
        </p>
      </div>
    </div>
  );
}
