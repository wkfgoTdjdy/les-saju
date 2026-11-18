import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DAY_MASTERS,
  DAY_MASTER_TYPE,
  ELEMENT_SPOTS,
  loveStyleFor,
} from "@/lib/les";

// 일간 10종 유형 소개 — 개인정보가 없는 정적 페이지라 색인 대상.
export const dynamicParams = false;

export function generateStaticParams() {
  return DAY_MASTERS.map((d) => ({ slug: d.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const find = (slug: string) => DAY_MASTERS.find((d) => d.slug === slug);
const label = (d: (typeof DAY_MASTERS)[number]) =>
  `${d.stem}${d.element}(${d.hanja})`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = find((await params).slug);
  if (!d) return {};
  const type = DAY_MASTER_TYPE[d.stem];
  return {
    title: `${label(d)} 일간 레즈 연애 스타일 — ${type.name}`,
    description: `${d.stem}${d.element} 일간의 레즈비언 사주 풀이. ${type.description}`,
    alternates: { canonical: `/types/${d.slug}` },
  };
}

export default async function TypePage({ params }: Props) {
  const d = find((await params).slug);
  if (!d) notFound();

  const type = DAY_MASTER_TYPE[d.stem];
  const love = loveStyleFor(d.element, d.yinYang);
  const spot = ELEMENT_SPOTS[d.element];
  const loveRows = [
    ["고백", love.confess],
    ["연락", love.contact],
    ["질투", love.jealousy],
    ["데이트", love.date],
    ["완급", love.tempo],
  ];

  return (
    <div className="grid gap-8">
      <section className="grid gap-3 text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-rose">
          {label(d)} 일간 · {d.yinYang}간
        </p>
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          {d.stem}
          {d.element} 일간은{" "}
          <span className="bg-gradient-to-r from-sunset-deep via-rose-soft to-rose-deep bg-clip-text text-transparent">
            {type.name}
          </span>
        </h1>
        <p className="mx-auto max-w-md leading-relaxed">{type.description}</p>
      </section>

      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-xl font-extrabold">
          {d.stem}
          {d.element} 일간의 연애 스타일
        </h2>
        <dl className="mt-4 grid gap-3 text-sm leading-relaxed">
          {loveRows.map(([k, v]) => (
            <div key={k}>
              <dt className="font-bold text-rose-deep">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-xl font-extrabold">
          {d.element} 기운이 강하다면 — {spot.headline}
        </h2>
        <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-relaxed">
          {spot.spots.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-rose">
          일간은 사주 여덟 글자 중 하나일 뿐 — 실제 스팟과 팸-부치 스펙트럼은 사주
          전체의 오행·십신 분포로 정해집니다. 같은 {d.stem}
          {d.element}이어도 결과는 다 달라요.
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-card p-6 text-center">
        <h2 className="text-xl font-extrabold">내 일간이 뭔지 모르겠다면</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-rose">
          생년월일만 넣으면 일간부터 팸-부치 스펙트럼, 남성운 정산, 동거지수까지
          한 번에 계산해드려요. 로그인 없음, 저장 없음.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-xl bg-gradient-to-r from-sunset via-rose-soft to-rose-deep px-6 py-3 font-extrabold text-white transition hover:opacity-90"
        >
          내 레즈 사주 보기 →
        </Link>
      </section>

      <nav aria-label="다른 일간 유형">
        <h2 className="mb-3 text-sm font-bold text-rose">다른 일간 유형</h2>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {DAY_MASTERS.filter((o) => o.slug !== d.slug).map((o) => (
            <Link
              key={o.slug}
              href={`/types/${o.slug}`}
              className="rounded-full border border-line bg-card px-3 py-1.5 transition hover:border-rose-soft"
            >
              {o.stem}
              {o.element} · {DAY_MASTER_TYPE[o.stem].name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
