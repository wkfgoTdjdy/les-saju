import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { calculateSaju, CalendarType, CALENDAR_LABEL, SajuResult } from "@/lib/saju";
import { buildReport, LesReport, DAY_MASTERS } from "@/lib/les";
import CopyLinkButton from "@/components/CopyLinkButton";
import TipJar from "@/components/TipJar";
import SajuChart from "@/components/SajuChart";
import Seal from "@/components/Seal";

// 생일이 담긴 URL이라 검색엔진 색인은 막는다 (링크를 아는 사람만 볼 수 있게).
export const metadata: Metadata = {
  title: "나의 레즈 사주 결과",
  robots: { index: false, follow: false },
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const CALENDARS: CalendarType[] = ["solar", "lunar", "lunar_leap"];

function Card({
  label,
  why,
  children,
}: {
  label: string;
  why?: string; // 계산 근거 — 접어둔다
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <p className="label">{label}</p>
      <div className="mt-2">{children}</div>
      {why && (
        <details className="why">
          <summary>왜 이렇게 나왔나요</summary>
          <p>{why}</p>
        </details>
      )}
    </section>
  );
}

// 플래그 5색 그라디언트는 화면에서 이 게이지 하나에만 쓴다 — 티부(오렌지) ↔ 온팸(핑크)
const FLAG_GRADIENT =
  "linear-gradient(to right, var(--color-flag-1), var(--color-flag-2), var(--color-flag-3), var(--color-flag-4), var(--color-flag-5))";

function SpectrumGauge({ report }: { report: LesReport }) {
  const { score, zone, tagline, twist } = report.spectrum;
  const pos = (score + 100) / 2; // -100~100 → 0~100%
  return (
    <div>
      <h2 className="title text-2xl">
        당신의 좌표: <span className="text-accent">{zone}</span>
      </h2>
      <div
        className="relative mt-6 h-3 rounded-full border border-line"
        style={{ background: FLAG_GRADIENT }}
      >
        <div
          className="absolute -top-1.5 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-card bg-ink"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="label mt-3 flex justify-between">
        <span>티부</span>
        <span>전천후</span>
        <span>온팸</span>
      </div>
      <p className="mt-4 leading-relaxed">{tagline}</p>
      <p className="note mt-3">
        <span className="font-medium">반전 한 스푼</span> — {twist}
      </p>
    </div>
  );
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nickname = typeof sp.n === "string" ? sp.n.slice(0, 20) : "";
  const date = typeof sp.d === "string" ? sp.d : "";
  const time = typeof sp.t === "string" && TIME_RE.test(sp.t) ? sp.t : null;
  const calendar = CALENDARS.includes(sp.cal as CalendarType)
    ? (sp.cal as CalendarType)
    : "solar";

  if (!DATE_RE.test(date)) redirect("/");

  let report: LesReport;
  let saju: SajuResult;
  try {
    saju = calculateSaju(date, time, calendar);
    report = buildReport(saju);
  } catch {
    // 존재하지 않는 음력 날짜 등 — 친절하게 돌려보낸다
    return (
      <div className="grid gap-4">
        <h1 className="title text-[28px] leading-[1.2]">계산할 수 없는 날짜예요</h1>
        <p className="leading-relaxed text-sub">
          음력 날짜가 존재하지 않는 조합일 수 있어요 (30일이 없는 달, 윤달이 없는 해 등).
        </p>
        <Link href="/" className="btn-secondary justify-self-start">
          다시 입력하기
        </Link>
      </div>
    );
  }

  const myType = DAY_MASTERS.find((d) => d.stem === saju.dayMaster.stem);

  const loveRows = [
    ["고백", report.love.confess],
    ["연락", report.love.contact],
    ["질투", report.love.jealousy],
    ["데이트", report.love.date],
  ];

  return (
    <div className="grid gap-4">
      <header className="mb-4 grid gap-4">
        <div className="grid gap-2">
          <p className="label tabular-nums">
            {CALENDAR_LABEL[calendar]} {date}
            {time ? ` · ${time}` : " · 시간 미상"} · {saju.animal}띠
          </p>
          <h1 className="title text-[32px] leading-[1.2] sm:text-[40px]">
            {nickname ? `${nickname}의 레즈 사주` : "나의 레즈 사주"}
          </h1>
        </div>
        <p className="font-medium">
          {report.spectrum.zone} · {report.type.name} · 동거지수 {report.uhaul.percent}%
        </p>
        <SajuChart
          saju={saju}
          showTenGods
          caption="분홍 글자가 일간, 곧 나입니다. 나머지 글자는 나와의 관계에 따라 비겁·식상·재성·관성·인성으로 나뉘고, 아래 결과는 전부 이 분포에서 나옵니다"
        />
      </header>

      <Card label="정체성 감정서" why={report.identity.why}>
        <h2 className="title text-xl leading-snug">{report.identity.headline}</h2>
        <p className="mt-2 leading-relaxed">{report.identity.body}</p>
        <p className="label mt-3">
          재미로 보는 감정입니다 — 정체성은 만세력이 아니라 본인이 정합니다
        </p>
      </Card>

      <Card label="남성운 정산" why={report.male.why}>
        <h2 className="title text-xl leading-snug">{report.male.headline}</h2>
        <p className="mt-2 leading-relaxed">{report.male.body}</p>
      </Card>

      <Card label="팸-부치 스펙트럼" why={report.spectrum.why}>
        <SpectrumGauge report={report} />
      </Card>

      <Card
        label="나의 유형"
        why={`유형은 일간(태어난 날의 천간) 하나로 정합니다. 명식표의 분홍 글자 ${saju.pillars.day.hanja[0]}(${saju.dayMaster.stem}${saju.dayMaster.element})가 당신의 일간.`}
      >
        <div className="flex items-center gap-3">
          <Seal hanja={saju.pillars.day.hanja[0]} />
          <h2 className="title text-xl">{report.type.name}</h2>
        </div>
        <p className="mt-3 leading-relaxed">{report.type.description}</p>
        {myType && (
          <p className="mt-3 text-sm">
            <Link href={`/types/${myType.slug}`} className="text-link">
              {saju.dayMaster.stem}
              {saju.dayMaster.element} 일간 더 읽기
            </Link>
          </p>
        )}
      </Card>

      <Card label="오행 밸런스">
        <div className="mt-3 grid gap-2">
          {(["목", "화", "토", "금", "수"] as const).map((el) => (
            <div key={el} className="flex items-center gap-3">
              <span className="w-4 text-sm">{el}</span>
              <div className="meter flex-1">
                <div
                  className={el === report.balance.dominant ? undefined : "!bg-ink/25"}
                  style={{
                    width: `${(report.balance.counts[el] / report.balance.total) * 100}%`,
                  }}
                />
              </div>
              <span className="label w-4 text-right tabular-nums">
                {report.balance.counts[el]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed">{report.balance.dominantComment}</p>
        <p className="note mt-3">{report.balance.lackingComment}</p>
      </Card>

      <Card
        label="연애할 때 나는"
        why={`일간의 오행(${saju.dayMaster.element})이 고백·연락·질투·데이트 스타일을, 음양(${saju.dayMaster.yinYang}간)이 완급을 정합니다.`}
      >
        <dl className="rows mt-3 text-sm leading-relaxed">
          {loveRows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[4rem_1fr] gap-3">
              <dt className="text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="note mt-4">{report.love.tempo}</p>
      </Card>

      <Card label="신살 리포트">
        <ul className="rows mt-3">
          {report.shinsals.map((s) => (
            <li key={s.name}>
              <p className="font-medium">{s.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-sub">{s.description}</p>
              <p className="label mt-1">{s.why}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card label={`${report.yearly.year}년 나의 연애운`} why={report.yearly.why}>
        <h2 className="title text-xl leading-snug">{report.yearly.headline}</h2>
        <p className="mt-2 leading-relaxed">{report.yearly.body}</p>
      </Card>

      <Card label="나를 살리는 상대" why={report.ideal.why}>
        <h2 className="title text-xl">{report.ideal.headline}</h2>
        <p className="mt-2 leading-relaxed">{report.ideal.body}</p>
        <p className="note mt-4">
          <span className="font-medium">천간합 상대</span> — 새벽까지 통화해도 할 말이 남는
          일간은{" "}
          <Link href={`/types/${report.ideal.hap.slug}`} className="text-link">
            {report.ideal.hap.label} · {report.ideal.hap.name}
          </Link>
        </p>
      </Card>

      <Card label="애인 찾을 스팟" why={report.hunting.why}>
        <h2 className="title text-xl">{report.hunting.headline}</h2>
        <ul className="rows mt-4 text-sm leading-relaxed">
          {report.hunting.spots.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        {report.hunting.bonus && <p className="note mt-4">{report.hunting.bonus}</p>}
      </Card>

      <Card label="동거지수 · 동거 속도" why={report.uhaul.why}>
        <p className="figure mt-3">{report.uhaul.percent}%</p>
        <div className="meter mt-4">
          <div style={{ width: `${report.uhaul.percent}%` }} />
        </div>
        <p className="mt-4 text-sm leading-relaxed">{report.uhaul.comment}</p>
      </Card>

      <Card label="밈 지수 3종">
        <ul className="rows mt-3">
          {report.memes.map((m) => (
            <li key={m.name}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{m.name}</p>
                <p className="text-xl font-medium tabular-nums">{m.percent}%</p>
              </div>
              <div className="meter mt-2">
                <div style={{ width: `${m.percent}%` }} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-sub">{m.comment}</p>
              <p className="label mt-1">{m.why}</p>
            </li>
          ))}
        </ul>
      </Card>

      <TipJar />

      <div className="mt-4 grid gap-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/couple" className="btn-primary">
            애인이랑 커플 궁합 보기
          </Link>
          <CopyLinkButton />
        </div>
        <p className="label">
          이 결과는 서버 어디에도 저장되지 않았어요. 생년월일과 닉네임은 위 링크 안에만
          존재합니다 — 링크를 아는 사람만 볼 수 있어요.{" "}
          <Link href="/" className="text-link">
            다른 생일로 다시 보기
          </Link>
        </p>
      </div>
    </div>
  );
}
