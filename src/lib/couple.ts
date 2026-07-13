// 커플 궁합 해석 — pairChemistry(오행 상생·상극) 위에 커플 전용 코너를 얹는다.
// 싸움 패턴, 먼저 연락하는 쪽, 동거지수, 금전운·성공운, 여행 케미, 고양이 입양. 전부 결정적 계산.
import { SajuResult, Element, pairChemistry, PairChemistry } from "./saju";
import { tenGodCounts, uhaulIndex, shinsals, spectrum, Spectrum } from "./les";

export interface Person {
  name: string;
  saju: SajuResult;
}

// ---------- 싸울 때 패턴 ----------

const FIGHT_STYLE: Record<Element, string> = {
  목: "직진 토론형 — 그 자리에서 조목조목 따져야 직성이 풀림",
  화: "폭발형 — 3초 안에 터지고 30분 안에 미안해짐",
  토: "삭히기형 — 말 없이 쌓아두다가 나중에 한꺼번에 꺼냄",
  금: "냉전 팩폭형 — 목소리는 안 높이는데 문장이 아픔",
  수: "잠수형 — 일단 사라졌다가 마음이 정리되면 긴 카톡으로 돌아옴",
};

export interface FightPattern {
  a: string;
  b: string;
  note: string;
}

function fightPattern(a: Person, b: Person, chem: PairChemistry): FightPattern {
  const ea = a.saju.dominantElement;
  const eb = b.saju.dominantElement;

  let note: string;
  if (ea === eb) {
    note = "둘이 똑같은 방식으로 싸워서 서로의 수를 다 읽음 — 싸움이 오래 갈 수가 없는 구조입니다.";
  } else if ((ea === "화" && eb === "수") || (ea === "수" && eb === "화")) {
    note = "한쪽이 타오를 때 한쪽은 잠수하는 시간차 조합 — '연락 두절 금지' 규칙 하나만 정해두면 큰 싸움이 없습니다.";
  } else if (chem.relationType === "상극" || chem.relationType === "충") {
    note = "싸움의 화력이 센 조합 — 대신 화해의 밀도도 그만큼 높습니다. 싸운 날 밤에 더 애틋해지는 타입.";
  } else if (chem.relationType === "상생") {
    note = "싸워도 회복이 빠른 조합 — 한쪽이 식으면 다른 쪽이 자연스럽게 데워줍니다.";
  } else {
    note = "서로 다른 방식이라 처음엔 어리둥절해도, 패턴만 파악하면 매뉴얼대로 화해 가능한 조합.";
  }

  return { a: FIGHT_STYLE[ea], b: FIGHT_STYLE[eb], note };
}

// ---------- 누가 먼저 연락하나 ----------

export interface FirstContact {
  winner: string | null; // null이면 동시
  comment: string;
}

function contactScore(p: Person): number {
  const tg = tenGodCounts(p.saju);
  return tg.식상 * 2 + tg.비겁 + (p.saju.dayMaster.yinYang === "양" ? 2 : 0);
}

function firstContact(a: Person, b: Person): FirstContact {
  const sa = contactScore(a);
  const sb = contactScore(b);
  if (sa === sb) {
    return {
      winner: null,
      comment: "동점입니다. 동시에 카톡을 치다가 '어 뭐야, 텔레파시?' 하는 커플이네요.",
    };
  }
  const [w, l] = sa > sb ? [a, b] : [b, a];
  return {
    winner: w.name,
    comment: `먼저 연락하는 쪽: ${w.name}. 표현(식상)과 추진(비겁) 기운이 더 강해서 읽씹의 시간을 못 견딥니다. ${l.name}은 답장 텀이 길어도 마음이 식은 게 아니에요 — 사주가 원래 그럼.`,
  };
}

// ---------- 동거지수 (개인 지수 합산) ----------

export interface CohabitIndex {
  percent: number;
  mover: string; // 먼저 부동산 앱을 켜는 쪽
  comment: string;
}

function cohabitIndex(a: Person, b: Person): CohabitIndex {
  const ua = uhaulIndex(a.saju);
  const ub = uhaulIndex(b.saju);
  const percent = Math.round((ua.percent + ub.percent) / 2);
  const mover = ua.percent >= ub.percent ? a.name : b.name;

  const comment =
    percent >= 75
      ? "만난 지 한 달이면 칫솔, 두 달이면 이사 트럭입니다. 보증금 얘기가 데이트 코스에 이미 들어와 있음."
      : percent >= 50
        ? "동거 욕구는 충분한데 각자 공간도 소중한 커플. 주 4일 합숙의 반동거로 시작하는 걸 추천합니다."
        : "각자의 집이 있어야 사랑이 오래 가는 조합. 동거 전에 여행부터 — 여행 스타일이 맞으면 그때 부동산 앱을 켜세요.";

  return { percent, mover, comment };
}

// ---------- 고양이 입양 궁합 ----------

export interface CatIndex {
  count: number; // 함께 살게 될 고양이 예상 마릿수
  comment: string;
}

function catIndex(a: Person, b: Person): CatIndex {
  // 토(정착)와 인성(돌봄 받는 기운 = 집사 자질)의 합산으로 마릿수 추정
  const care =
    a.saju.elementCounts.토 +
    b.saju.elementCounts.토 +
    tenGodCounts(a.saju).인성 +
    tenGodCounts(b.saju).인성;
  const count = Math.max(0, Math.min(4, Math.round(care / 3)));

  const comment =
    count === 0
      ? "고양이보다 둘이서 노는 게 더 바쁜 커플. 대신 남의 집 고양이 사진은 열심히 저장함."
      : count === 1
        ? "한 마리를 공주님처럼 모시는 집사 커플. 고양이 이름 정하다가 첫 싸움 할 수 있음."
        : count >= 3
          ? `돌봄 기운이 넘칩니다. ${count}마리 예정 — 임보만 하려던 애가 다 눌러앉는 그 집이 됩니다.`
          : "두 마리가 국룰. 첫째 데려오고 6개월 안에 '혼자 외로워 보여서'라며 둘째가 옵니다.";

  return { count, comment };
}

// ---------- 함께 있으면 트이는 운 (금전운·성공운) ----------

export interface CoupleLuck {
  percent: number;
  headline: string;
  comment: string;
}

/** 커플 금전운 — 두 사람의 재성(쟁취·재물)과 토(저축·안정) 기운 합산 */
function wealthLuck(a: Person, b: Person): CoupleLuck {
  const jae = tenGodCounts(a.saju).재성 + tenGodCounts(b.saju).재성;
  const to = a.saju.elementCounts.토 + b.saju.elementCounts.토;
  const percent = Math.max(20, Math.min(98, 40 + jae * 8 + to * 4));

  // 플렉스 담당: 재성이 많은 쪽 / 통장 지킴이: 토+인성이 많은 쪽
  const flexer =
    tenGodCounts(a.saju).재성 >= tenGodCounts(b.saju).재성 ? a.name : b.name;
  const saverScore = (p: Person) => p.saju.elementCounts.토 + tenGodCounts(p.saju).인성;
  const saver = saverScore(a) >= saverScore(b) ? a.name : b.name;

  const comment =
    percent >= 75
      ? `둘이 만나면 돈이 붙는 조합입니다. 플렉스 담당은 ${flexer}, 통장 지킴이는 ${saver} — 역할 분담이 사주에 이미 새겨져 있어요. 공동 적금 하나 트면 무섭게 모입니다.`
      : percent >= 50
        ? `쓸 때 쓰고 모을 때 모으는 균형형 커플. ${flexer}가 지르려고 하면 ${saver}가 장바구니에서 하루 재워두자고 합니다 — 그 하루가 이 커플의 재테크 비결.`
        : `돈보다 낭만이 먼저인 커플 — 통장은 얇아도 추억은 부자입니다. 대신 데이트 통장 하나만 만들어두세요. 낭만에도 예산이 있으면 더 오래갑니다.`;

  return { percent, headline: "둘이 만나면 트이는 금전운", comment };
}

/** 커플 성공운 — 관성(커리어·카리스마)과 식상(창작·표현) 기운 합산 */
function successLuck(a: Person, b: Person): CoupleLuck {
  const gwan = tenGodCounts(a.saju).관성 + tenGodCounts(b.saju).관성;
  const sik = tenGodCounts(a.saju).식상 + tenGodCounts(b.saju).식상;
  const percent = Math.max(25, Math.min(98, 35 + gwan * 9 + sik * 6));

  const comment =
    gwan > sik
      ? `관성(커리어 기운) 합이 강한 파워커플 — 승진과 합격 소식이 번갈아 들려옵니다. 서로의 일을 존중하는 게 이 커플의 사랑 언어. 바쁜 시즌엔 '각자 열심히, 주말에 몰아서'가 공식입니다.`
      : sik > gwan
        ? `식상(창작·표현 기운) 합이 강한 크리에이티브 커플 — 같이 뭔가 만들면 터집니다. 사이드 프로젝트, 유튜브, 스마트스토어… 둘이 시작한 일이 본업을 넘볼 수 있어요.`
        : `커리어와 창작이 균형 잡힌 조합 — 한쪽이 벌이를 지키고 한쪽이 판을 벌입니다. 서로의 도전을 밀어주면 5년 뒤 완전히 다른 체급이 되어 있을 커플.`;

  return { percent, headline: "둘이 만나면 트이는 성공운", comment };
}

// ---------- 여행 케미 (역마살 조합) ----------

export interface TravelChemistry {
  comment: string;
}

function travelChemistry(a: Person, b: Person): TravelChemistry {
  const hasYeokma = (p: Person) => shinsals(p.saju).some((s) => s.name === "역마살");
  const count = (hasYeokma(a) ? 1 : 0) + (hasYeokma(b) ? 1 : 0);

  const comment =
    count === 2
      ? "둘 다 역마살 보유 — 여권에 도장 찍으러 다니는 커플입니다. 기념일마다 도시가 하나씩 늘어나요. 다음 퀴퍼는 해외로 가세요, 사주가 허락했습니다."
      : count === 1
        ? `${hasYeokma(a) ? a.name : b.name}의 역마살이 여행을 끌고, 다른 한 명이 숙소 컨디션을 책임지는 조합 — 계획과 안락함이 다 잡힙니다. 싸우는 건 딱 하나, 아침 일찍 나가느냐 마느냐.`
        : "둘 다 집이 최고인 커플 — 여행은 짧고 굵게, 호캉스가 정답입니다. 체크인하자마자 가운 입고 룸서비스 시키는 그 순간이 이 커플의 진짜 휴가.";

  return { comment };
}

// ---------- 종합 ----------

export interface CoupleReport {
  chemistry: PairChemistry;
  spectrumA: Spectrum;
  spectrumB: Spectrum;
  fight: FightPattern;
  contact: FirstContact;
  cohabit: CohabitIndex;
  cat: CatIndex;
  wealth: CoupleLuck;
  success: CoupleLuck;
  travel: TravelChemistry;
}

export function buildCoupleReport(a: Person, b: Person): CoupleReport {
  const chemistry = pairChemistry(a.saju, b.saju);
  return {
    chemistry,
    spectrumA: spectrum(a.saju),
    spectrumB: spectrum(b.saju),
    fight: fightPattern(a, b, chemistry),
    contact: firstContact(a, b),
    cohabit: cohabitIndex(a, b),
    cat: catIndex(a, b),
    wealth: wealthLuck(a, b),
    success: successLuck(a, b),
    travel: travelChemistry(a, b),
  };
}
