import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DAY_MASTERS,
  DAY_MASTER_TYPE,
  ELEMENT_SPOTS,
  loveStyleFor,
} from "@/lib/les";
import Seal from "@/components/Seal";

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
      <section className="grid gap-4">
        <p className="label">
          {label(d)} 일간 · {d.yinYang}간
        </p>
        <div className="flex items-center gap-4">
          <Seal hanja={d.hanja} size={64} />
          <h1 className="title text-[28px] leading-[1.2] sm:text-[36px]">
            {d.stem}
            {d.element} 일간은
            <br />
            {type.name}
          </h1>
        </div>
        <p className="text-lg leading-7 text-sub">{type.description}</p>
      </section>

      <section className="card">
        <h2 className="title text-xl">
          {d.stem}
          {d.element} 일간의 연애 스타일
        </h2>
        <dl className="rows mt-4 text-sm leading-relaxed">
          {loveRows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[4rem_1fr] gap-3">
              <dt className="text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card">
        <h2 className="title text-xl">
          {d.element} 기운이 강하다면 — {spot.headline}
        </h2>
        <ul className="rows mt-4 text-sm leading-relaxed">
          {spot.spots.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="label mt-4">
          일간은 사주 여덟 글자 중 하나일 뿐 — 실제 스팟과 팸-부치 스펙트럼은 사주
          전체의 오행·십신 분포로 정해집니다. 같은 {d.stem}
          {d.element}이어도 결과는 다 달라요.
        </p>
      </section>

      <section className="card grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="title text-xl">내 일간이 뭔지 모르겠다면</h2>
          <p className="mt-2 text-sm leading-relaxed text-sub">
            생년월일만 넣으면 일간부터 팸-부치 스펙트럼, 남성운 정산, 동거지수까지 한 번에
            계산해드려요. 로그인 없음, 저장 없음.
          </p>
        </div>
        <Link href="/" className="btn-primary">
          내 레즈 사주 보기
        </Link>
      </section>

      <nav aria-label="다른 일간 유형">
        <h2 className="label mb-3">다른 일간 유형</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {DAY_MASTERS.filter((o) => o.slug !== d.slug).map((o) => (
            <Link
              key={o.slug}
              href={`/types/${o.slug}`}
              className="rounded-lg border border-line bg-card px-3 py-2 transition-colors duration-150 hover:bg-raised"
            >
              <span className="text-muted">
                {o.stem}
                {o.element}
              </span>{" "}
              {DAY_MASTER_TYPE[o.stem].name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
