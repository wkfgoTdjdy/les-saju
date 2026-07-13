import type { Metadata } from "next";
import Link from "next/link";
import BirthForm from "@/components/BirthForm";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FEATURES = [
  {
    emoji: "🎉",
    title: "남성운 정산",
    body: "전통 사주가 '남성운'이라 우기던 관성, 여기서는 커리어와 카리스마로 다시 읽습니다. 공석이면 축하 드리고요.",
  },
  {
    emoji: "🏳️‍🌈",
    title: "팸-부치 스펙트럼",
    body: "십신 분포로 계산한 나의 좌표. 티부부터 립스틱팸까지 — 물론 반전 디테일도 함께.",
  },
  {
    emoji: "📍",
    title: "애인 찾을 스팟",
    body: "오행이 알려주는 나의 사냥터. 클라이밍장이 국룰인 사주가 따로 있습니다.",
  },
  {
    emoji: "🚚",
    title: "유홀 지수",
    body: "만난 지 한 달 만에 이사 트럭 부르는 그 기질, 사주에 다 나와 있어요.",
  },
];

export default function Home() {
  return (
    <div className="grid gap-12">
      <section className="grid gap-4 text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-rose">
          for lesbians, by 만세력
        </p>
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          사주에 새겨진
          <br />
          <span className="bg-gradient-to-r from-sunset-deep via-rose-soft to-rose-deep bg-clip-text text-transparent">
            나의 레즈 기질
          </span>
        </h1>
        <p className="mx-auto max-w-md text-rose">
          생년월일 하나면 끝. 만세력(절기 기준)으로 사주 4주를 계산해서
          당신만 몰랐던 당신 얘기를 해드립니다.
        </p>
        <div className="mx-auto flex flex-wrap justify-center gap-2 text-xs font-semibold">
          <span className="rounded-full border border-line bg-card px-3 py-1.5">🔒 로그인 필요 없음</span>
          <span className="rounded-full border border-line bg-card px-3 py-1.5">생년월일·닉네임 외 수집 없음</span>
          <span className="rounded-full border border-line bg-card px-3 py-1.5">서버 저장 없음 · 아웃팅 걱정 없음</span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-sm">
        <BirthForm />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-card p-5">
            <p className="text-2xl">{f.emoji}</p>
            <h2 className="mt-2 font-bold">{f.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-line bg-card p-6 text-center">
        <p className="text-3xl">💌</p>
        <h2 className="mt-2 text-xl font-extrabold">애인이랑 커플 궁합 보기</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-rose">
          초대 링크를 보내면 애인이 생일을 입력하는 순간 AI가 둘의 궁합을 풀어드려요.
          싸움 매뉴얼부터 고양이 입양 예상까지 — 커플 사주는 딱 1회, 신중하게.
        </p>
        <Link
          href="/couple"
          className="mt-4 inline-block rounded-xl bg-gradient-to-r from-sunset via-rose-soft to-rose-deep px-6 py-3 font-extrabold text-white transition hover:opacity-90"
        >
          커플 궁합 시작하기 →
        </Link>
      </section>
    </div>
  );
}
