import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { calculateSaju, formatPillars, CalendarType, CALENDAR_LABEL } from "@/lib/saju";
import { buildReport, LesReport } from "@/lib/les";
import CopyLinkButton from "@/components/CopyLinkButton";

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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-6">
      <p className="font-mono text-xs uppercase tracking-[2px] text-rose">{label}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SpectrumGauge({ report }: { report: LesReport }) {
  const { score, zone, tagline, twist } = report.spectrum;
  const pos = (score + 100) / 2; // -100~100 → 0~100%
  return (
    <div>
      <h2 className="text-2xl font-extrabold">
        당신의 좌표: <span className="text-rose-deep">{zone}</span>
      </h2>
      <div className="relative mt-5 h-4 rounded-full bg-gradient-to-r from-sunset-deep via-sunset-soft to-rose-deep">
        <div
          className="absolute -top-1.5 h-7 w-7 -translate-x-1/2 rounded-full border-4 border-white bg-ink shadow"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-rose">
        <span>티부</span>
        <span>전천후</span>
        <span>온팸</span>
      </div>
      <p className="mt-4 leading-relaxed">{tagline}</p>
      <p className="mt-2 rounded-xl bg-cream p-3 text-sm leading-relaxed">
        <strong>반전 한 스푼:</strong> {twist}
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
  let pillarsText: string;
  let animal: string;
  try {
    const saju = calculateSaju(date, time, calendar);
    report = buildReport(saju);
    pillarsText = formatPillars(saju);
    animal = saju.animal;
  } catch {
    // 존재하지 않는 음력 날짜 등 — 친절하게 돌려보낸다
    return (
      <div className="grid gap-4 text-center">
        <h1 className="text-2xl font-extrabold">앗, 계산할 수 없는 날짜예요</h1>
        <p className="text-rose">
          음력 날짜가 존재하지 않는 조합일 수 있어요 (30일이 없는 달, 윤달이 없는 해 등).
        </p>
        <Link href="/" className="font-bold text-rose-deep underline">
          다시 입력하기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <header className="text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-rose">
          {CALENDAR_LABEL[calendar]} {date}
          {time ? ` · ${time}` : " · 시간 미상"}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">
          {nickname ? `${nickname}의 레즈 사주` : "나의 레즈 사주"}
        </h1>
        <p className="mt-2 font-mono text-sm text-rose">
          {pillarsText} · {animal}띠
        </p>
      </header>

      <Card label="정체성 감정서">
        <h2 className="text-xl font-extrabold leading-snug">{report.identity.headline}</h2>
        <p className="mt-2 leading-relaxed">{report.identity.body}</p>
        <p className="mt-3 text-xs text-rose">
          * 재미로 보는 감정입니다 — 정체성은 만세력이 아니라 본인이 정합니다.
        </p>
      </Card>

      <Card label="남성운 정산">
        <h2 className="text-xl font-extrabold leading-snug">{report.male.headline}</h2>
        <p className="mt-2 leading-relaxed">{report.male.body}</p>
      </Card>

      <Card label="팸-부치 스펙트럼">
        <SpectrumGauge report={report} />
      </Card>

      <Card label="나의 유형">
        <h2 className="text-xl font-extrabold">{report.type.name}</h2>
        <p className="mt-2 leading-relaxed">{report.type.description}</p>
      </Card>

      <Card label="오행 밸런스">
        <div className="grid gap-2">
          {(["목", "화", "토", "금", "수"] as const).map((el) => (
            <div key={el} className="flex items-center gap-3">
              <span className="w-6 font-mono text-sm font-bold">{el}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sunset to-rose-deep"
                  style={{
                    width: `${(report.balance.counts[el] / report.balance.total) * 100}%`,
                  }}
                />
              </div>
              <span className="w-5 text-right font-mono text-xs text-rose">
                {report.balance.counts[el]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed">{report.balance.dominantComment}</p>
        <p className="mt-2 rounded-xl bg-cream p-3 text-sm leading-relaxed">
          {report.balance.lackingComment}
        </p>
      </Card>

      <Card label="연애할 때 나는">
        <ul className="grid gap-2 text-sm leading-relaxed">
          <li className="rounded-xl bg-cream p-3">
            <strong>💘 고백</strong> — {report.love.confess}
          </li>
          <li className="rounded-xl bg-cream p-3">
            <strong>📱 연락</strong> — {report.love.contact}
          </li>
          <li className="rounded-xl bg-cream p-3">
            <strong>🔥 질투</strong> — {report.love.jealousy}
          </li>
          <li className="rounded-xl bg-cream p-3">
            <strong>🗓️ 데이트</strong> — {report.love.date}
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed">{report.love.tempo}</p>
      </Card>

      <Card label="신살 리포트">
        <ul className="grid gap-4">
          {report.shinsals.map((s) => (
            <li key={s.name}>
              <p className="font-bold">
                {s.emoji} {s.name}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{s.description}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card label={`${report.yearly.year}년 나의 연애운`}>
        <h2 className="text-xl font-extrabold leading-snug">{report.yearly.headline}</h2>
        <p className="mt-2 leading-relaxed">{report.yearly.body}</p>
      </Card>

      <Card label="나를 살리는 상대">
        <h2 className="text-xl font-extrabold">{report.ideal.headline}</h2>
        <p className="mt-2 leading-relaxed">{report.ideal.body}</p>
      </Card>

      <Card label="애인 찾을 스팟">
        <h2 className="text-xl font-extrabold">{report.hunting.headline}</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
          {report.hunting.spots.map((s) => (
            <li key={s} className="rounded-xl bg-cream p-3">
              {s}
            </li>
          ))}
        </ul>
        {report.hunting.bonus && (
          <p className="mt-3 text-sm font-semibold text-rose-deep">{report.hunting.bonus}</p>
        )}
      </Card>

      <Card label="동거지수">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-rose-deep">
            {report.uhaul.percent}%
          </span>
          <span className="font-mono text-xs text-rose">🚚 동거 속도</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-cream">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sunset to-rose-deep"
            style={{ width: `${report.uhaul.percent}%` }}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed">{report.uhaul.comment}</p>
      </Card>

      <div className="mt-2 grid gap-3 text-center">
        <CopyLinkButton />
        <Link
          href="/couple"
          className="mx-auto rounded-xl border-2 border-rose-deep px-5 py-3 font-bold text-rose-deep transition hover:bg-rose-deep hover:text-white"
        >
          💌 애인이랑 커플 궁합 보기
        </Link>
        <Link href="/" className="text-sm font-semibold text-rose underline">
          다른 생일로 다시 보기
        </Link>
        <p className="text-xs leading-relaxed text-rose">
          🔒 이 결과는 서버 어디에도 저장되지 않았어요. 생년월일과 닉네임은 위 링크 안에만
          존재합니다 — 링크를 아는 사람만 볼 수 있어요.
        </p>
      </div>
    </div>
  );
}
