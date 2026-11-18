import type { Metadata } from "next";
import Link from "next/link";
import BirthForm from "@/components/BirthForm";
import { siteUrl } from "@/lib/site";
import { DAY_MASTERS, DAY_MASTER_TYPE, lesType } from "@/lib/les";
import { calculateSaju } from "@/lib/saju";
import SajuChart from "@/components/SajuChart";
import Seal from "@/components/Seal";
import TipJar from "@/components/TipJar";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FAQ = [
  {
    q: "레즈비언 사주란 무엇인가요?",
    a: "생년월일로 사주팔자(사주 4주)를 계산하되, 전통 사주의 이성애 전제를 커뮤니티 감수성으로 재해석한 사주입니다. '남성운'으로 읽히던 관성은 커리어와 카리스마로, 도화살은 여자한테 인기 많은 살로 풀이합니다. 만세력(절기 기준) 계산이라 사주 자체는 정통 방식 그대로예요.",
  },
  {
    q: "팸-부치 스펙트럼은 어떻게 계산하나요?",
    a: "사주의 십신(비겁·식상·재성·관성·인성) 분포로 티부부터 온팸까지의 좌표를 계산합니다. 주체성이 강한 비겁·재성은 부치 방향, 표현·수용의 식상·인성은 팸 방향 가중치를 줍니다. 어디까지나 재미용 지표이며, 정체성은 언제나 본인이 정합니다.",
  },
  {
    q: "레즈비언 커플 궁합은 어떻게 보나요?",
    a: "내 생일을 입력해 초대 링크를 만들고 애인에게 보내면, 애인이 생일을 입력하는 순간 AI가 두 사람의 궁합을 풀어줍니다. 오행 상생·상극과 천간합·충으로 케미 점수를 계산하고, 싸움 매뉴얼, 동거지수, 금전운·성공운, 고양이 입양 예상까지 알려드려요. 커플 궁합은 초대 1건당 1회만 볼 수 있습니다.",
  },
  {
    q: "개인정보는 안전한가요? 아웃팅 걱정은 없나요?",
    a: "로그인이 없고, 저장하는 것은 커플 궁합의 생년월일과 닉네임뿐입니다. 솔로 사주는 아예 서버에 저장되지 않고 결과 링크에만 담깁니다. 모든 결과 페이지는 검색엔진 색인이 차단되어 있어 링크(코드)를 아는 사람만 볼 수 있어요.",
  },
  {
    q: "음력 생일이나 태어난 시간을 모르는 경우도 되나요?",
    a: "양력·음력·음력(윤달)을 모두 지원합니다. 태어난 시간은 선택 입력이며, 모르면 비워두세요 — 시주를 제외한 3주(연·월·일)로 계산합니다. 시간까지 알면 스펙트럼과 신살이 더 정확해집니다.",
  },
];

const FEATURES = [
  {
    title: "남성운 정산",
    body: "전통 사주가 '남성운'이라 우기던 관성, 여기서는 커리어와 카리스마로 다시 읽습니다. 공석이면 축하 드리고요.",
  },
  {
    title: "팸-부치 스펙트럼",
    body: "십신 분포로 계산한 나의 좌표. 티부부터 온팸까지 — 물론 반전 디테일도 함께.",
  },
  {
    title: "애인 찾을 스팟",
    body: "오행이 알려주는 나의 사냥터. 클라이밍장이 국룰인 사주가 따로 있습니다.",
  },
  {
    title: "동거지수",
    body: "만난 지 한 달 만에 이사 트럭 부르는 그 기질, 사주에 다 나와 있어요.",
  },
];

// 히어로에 보여주는 예시 명식 — 실제 계산 결과 (특정인의 생일이 아닌 임의의 날짜)
const SAMPLE = { date: "1995-06-15", time: "09:30" };

export default function Home() {
  const sample = calculateSaju(SAMPLE.date, SAMPLE.time, "solar");
  const sampleType = lesType(sample);

  return (
    <div className="wide grid gap-20">
      <section className="grid gap-x-16 gap-y-10 lg:grid-cols-[1fr_26rem] lg:items-center">
        <div className="grid gap-4">
          <p className="label">레즈비언 전용 사주</p>
          <h1 className="title text-[40px] leading-[1.15] sm:text-[56px] sm:leading-[1.1]">
            사주에 새겨진
            <br />
            나의 레즈 기질
          </h1>
          <p className="max-w-md text-lg leading-7 text-sub">
            생년월일 하나면 끝. 만세력(절기 기준)으로 사주 4주를 계산해서 당신만 몰랐던
            당신 얘기를 해드립니다
          </p>
        </div>

        <div className="card lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <BirthForm />
        </div>

        <div className="grid gap-4 lg:col-start-1">
          <SajuChart
            saju={sample}
            caption={`예시 명식 · 양력 ${SAMPLE.date} ${SAMPLE.time}`}
          />
          <div className="flex items-center gap-3">
            <Seal hanja={sample.pillars.day.hanja[0]} />
            <p className="text-sm leading-5">
              <span className="text-muted">
                {sample.dayMaster.stem}
                {sample.dayMaster.element} 일간
              </span>
              <br />
              <span className="font-medium">{sampleType.name}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="border-t border-line pt-4">
            <h2 className="font-medium">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-sub">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="card grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="title text-2xl">애인이랑 커플 궁합 보기</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-sub">
            초대 링크를 보내면 애인이 생일을 입력하는 순간 AI가 둘의 궁합을 풀어드려요.
            싸움 매뉴얼부터 고양이 입양 예상까지 — 커플 사주는 딱 1회, 신중하게.
          </p>
        </div>
        <Link href="/couple" className="btn-secondary">
          커플 궁합 시작하기
        </Link>
      </section>

      <section>
        <h2 className="title mb-4 text-2xl">일간별 레즈 유형 10가지</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {DAY_MASTERS.map((d) => (
            <Link
              key={d.slug}
              href={`/types/${d.slug}`}
              className="flex items-center gap-3 rounded-lg border border-line bg-card p-3 transition-colors duration-150 hover:bg-raised"
            >
              <span className="font-serif text-2xl leading-none font-medium">{d.hanja}</span>
              <span className="text-sm leading-5">
                <span className="text-muted">
                  {d.stem}
                  {d.element}
                </span>
                <br />
                {DAY_MASTER_TYPE[d.stem].name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <TipJar />

      <section className="max-w-2xl">
        <h2 className="title mb-4 text-2xl">자주 묻는 질문</h2>
        <div className="border-b border-line">
          {FAQ.map((item) => (
            <details key={item.q} className="border-t border-line">
              <summary className="cursor-pointer py-4 font-medium marker:text-muted">
                {item.q}
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-sub">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "LES SAJU",
              url: siteUrl,
              applicationCategory: "EntertainmentApplication",
              inLanguage: "ko",
              description:
                "레즈비언 전용 사주 — 생년월일로 팸-부치 스펙트럼, 남성운 정산, 레즈비언 커플 궁합과 AI 리포트를 제공합니다.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            },
          ]),
        }}
      />
    </div>
  );
}
