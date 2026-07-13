// 커플 궁합 해석 — pairChemistry(오행 상생·상극) 위에 커플 전용 코너를 얹는다.
// 싸움 패턴, 먼저 연락하는 쪽, 동거 지수, 고양이 입양, 좁은 판 경고. 전부 결정적 계산.
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

// ---------- 동거 지수 (유홀 합산) ----------

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

// ---------- 좁은 판 경고 ----------

export interface SmallWorld {
  percent: number; // 전 애인의 전 애인일 확률 (재미용)
  comment: string;
}

function smallWorld(a: Person, b: Person): SmallWorld {
  // 판은 원래 좁다(기본 35%). 도화살은 인맥 반경을 넓히고(+15),
  // 역마살은 원정을 다녀서 겹칠 판을 더 키운다(+10).
  let percent = 35;
  for (const p of [a, b]) {
    const names = shinsals(p.saju).map((s) => s.name);
    if (names.includes("도화살")) percent += 15;
    if (names.includes("역마살")) percent += 10;
  }
  percent = Math.min(95, percent);

  const comment =
    percent >= 70
      ? "인스타 팔로워를 지금 교차 검증하세요. 공통 팔로워 중에 두 사람 모두의 과거가 있습니다."
      : percent >= 50
        ? "아직 발견 안 됐을 뿐입니다. 언젠가 술자리에서 '어? 너 걔 알아?'가 나옵니다."
      : "비교적 안전한 확률이지만, 어차피 판은 좁습니다. 퀴퍼에서 전 애인 마주칠 준비는 늘 되어 있어야 함.";

  return { percent, comment };
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
  smallWorld: SmallWorld;
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
    smallWorld: smallWorld(a, b),
  };
}
