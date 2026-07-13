// LES SAJU 해석 로직 — 십신 분포, 팸-부치 스펙트럼, 남성운 정산, 신살 재해석.
// 전부 결정적 계산. 톤 원칙: 셀프디스가 아니라 셀프축하, 스테레오타입엔 반전 한 스푼.
import {
  SajuResult,
  Element,
  Pillar,
  GENERATES,
  CONTROLS,
} from "./saju";

// ---------- 십신(十神) — 일간 기준 오행 관계 5분류 ----------
// 음양까지 나눈 10분류 대신 오행 단위 5분류를 쓴다 (해석 단순화).
// 비겁: 나와 같은 오행 / 식상: 내가 생하는 / 재성: 내가 극하는 /
// 관성: 나를 극하는 (전통 사주의 "남성운") / 인성: 나를 생하는

export type TenGod = "비겁" | "식상" | "재성" | "관성" | "인성";

export type TenGodCounts = Record<TenGod, number>;

export function tenGodCounts(saju: SajuResult): TenGodCounts {
  const dm = saju.dayMaster.element;
  const counts: TenGodCounts = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };

  const classify = (el: Element): TenGod => {
    if (el === dm) return "비겁";
    if (GENERATES[dm] === el) return "식상";
    if (CONTROLS[dm] === el) return "재성";
    if (CONTROLS[el] === dm) return "관성";
    return "인성";
  };

  const { year, month, day, time } = saju.pillars;
  const chars: Element[] = [];
  for (const p of [year, month, day, time]) {
    if (!p) continue;
    chars.push(p.stemElement, p.branchElement);
  }
  // 일간 자신은 제외 — 연·월 4자 다음이 일간이므로 항상 인덱스 4
  chars.splice(4, 1);

  for (const el of chars) counts[classify(el)]++;
  return counts;
}

// ---------- 팸-부치 스펙트럼 ----------
// 좌표: -100(티부) ~ +100(립스틱팸). 재미용 지표이며 사람을 가두는 라벨이 아니다 —
// 결과에는 항상 반전 디테일(twist)을 함께 낸다.

export interface Spectrum {
  score: number; // -100 ~ 100
  zone: "티부" | "소프트부치" | "전천후" | "소프트팸" | "립스틱팸";
  tagline: string;
  twist: string; // 반전 한 스푼
}

const ZONE_TAGLINE: Record<Spectrum["zone"], string> = {
  티부: "설명이 필요 없음. 공항 검색대에서 '저기요 손님' 소리 들어본 적 있는 기세.",
  소프트부치: "셔츠 소매 걷는 걸로 다 해먹는 타입. 본인은 꾸민 적 없다고 함.",
  전천후: "그날의 기분이 곧 정체성. 옷장에 슬랙스와 원피스가 사이좋게 걸려 있음.",
  소프트팸: "다정함이 기본값. 근데 운전대 잡으면 사람이 달라짐.",
  립스틱팸: "풀메이크업은 자기표현이자 무기. 근데 좋아하는 사람 앞에서만 순해짐.",
};

export function spectrum(saju: SajuResult): Spectrum {
  const tg = tenGodCounts(saju);

  // 가중치 (재미용 휴리스틱):
  // 비겁(주체성)·재성(쟁취) → 부치 방향, 식상(표현·끼)·인성(수용) → 팸 방향
  let raw =
    tg.비겁 * -12 +
    tg.재성 * -8 +
    tg.식상 * 8 +
    tg.인성 * 12 +
    tg.관성 * 4;

  raw += saju.dayMaster.yinYang === "양" ? -10 : 10;

  // 시주 유무에 따른 글자 수 차이 보정 (시주 없으면 5자, 있으면 7자)
  const total = Object.values(tg).reduce((a, b) => a + b, 0);
  raw = raw * (7 / total);

  const score = Math.max(-100, Math.min(100, Math.round(raw)));

  const zone: Spectrum["zone"] =
    score <= -60 ? "티부" :
    score <= -20 ? "소프트부치" :
    score < 20 ? "전천후" :
    score < 60 ? "소프트팸" : "립스틱팸";

  // 반전 디테일 — 스펙트럼 반대 방향 기운 중 가장 강한 것을 근거로
  const twist =
    zone === "티부" || zone === "소프트부치"
      ? tg.인성 >= 2
        ? "근데 인성이 발달해서, 애인이 아프면 죽 끓여서 달려가는 극진한 간호사 모드가 숨어 있음."
        : tg.식상 >= 2
          ? "근데 식상이 살아 있어서, 술자리에서 제일 웃긴 사람은 결국 이 사람임."
          : "근데 무서운 영화는 못 봄."
      : zone === "소프트팸" || zone === "립스틱팸"
        ? tg.비겁 >= 2
          ? "근데 비겁이 튼튼해서, 이사할 때 짐은 본인이 다 듦. 벌레도 본인이 잡음."
          : tg.재성 >= 2
            ? "근데 재성이 발달해서, 데이트 코스 예약과 결제는 이미 끝나 있음."
            : "근데 팔씨름은 의외로 잘함."
        : "오늘은 부치, 내일은 팸. 정하는 건 언제나 본인임.";

  return { score, zone, tagline: ZONE_TAGLINE[zone], twist };
}

// ---------- 남성운 정산 (관성 재해석) ----------
// 전통 사주가 관성을 '남성운'으로 읽는 걸 뒤집는 코너. "남편" 같은 이성애 전제 워딩은
// 쓰지 않는다 — "남성"으로 표기한다.

export interface MaleAudit {
  count: number;
  headline: string;
  body: string;
}

export function maleAudit(saju: SajuResult): MaleAudit {
  const count = tenGodCounts(saju).관성;
  if (count === 0) {
    return {
      count,
      headline: "🎉 축하합니다, 사주에 남성운이 없으시네요",
      body: "관성(전통 사주에서 '남성운'이라 우기는 그것)이 완전 공석입니다. 만세력이 이미 다 알고 있었다는 뜻. 운명 감정 결과: 정상 영업 중.",
    };
  }
  if (count === 1) {
    return {
      count,
      headline: "관성 1개 발견 — 무시하셔도 됩니다",
      body: "전통 사주라면 '남성운'이라고 호들갑 떨었겠지만, 레즈 사주에서 관성 1개는 '마감 기한' 정도로 읽습니다. 일은 제때 하는 사주네요.",
    };
  }
  return {
    count,
    headline: `관성 ${count}개 — 남성 아니고 커리어입니다`,
    body: "레즈 사주에서 관성은 남성이 아니라 카리스마와 커리어로 읽습니다. 조직을 휘어잡는 기운이 강한 사주 — 승진운이라고 부르는 게 정확합니다.",
  };
}

// ---------- 일간 레즈 유형 밈 ----------

export interface LesType {
  name: string;
  description: string;
}

const DAY_MASTER_TYPE: Record<string, LesType> = {
  갑: {
    name: "키 큰 나무형",
    description: "듬직하고 올곧아서 다들 한 번씩 기대보고 싶어함. 정작 본인은 기대는 법을 모름 — 그게 매력이자 숙제.",
  },
  을: {
    name: "스며드는 덩굴형",
    description: "부드럽게 다가와서 어느새 상대의 일상에 뿌리내리는 타입. 헤어지고 나서야 다들 깨달음 — 아 그게 사랑이었구나.",
  },
  병: {
    name: "직진 소방차형",
    description: "좋아하면 온 동네가 다 앎. 본인만 티 안 난다고 생각함. 고백은 항상 이쪽이 먼저.",
  },
  정: {
    name: "조용한 장작불형",
    description: "티 안 내는데 오래 타는 짝사랑 장인. 근데 한번 곁을 주면 그 온기가 평생 감. 겨울에 만나면 최고의 애인.",
  },
  무: {
    name: "무뚝뚝한 산맥형",
    description: "말수 적고 표현에 서툰데, 어느 날 보면 애인 자취방 선반을 다 고쳐놨음. 사랑을 실리콘과 드릴로 말하는 타입.",
  },
  기: {
    name: "텃밭 어멈형",
    description: "챙겨주는 걸로 사랑을 표현함. 데이트 가방에서 물티슈·밴드·비상약이 다 나옴. 모두의 언니, 근데 애인 앞에선 막내.",
  },
  경: {
    name: "츤데레 강철형",
    description: "말은 짧고 행동은 다 해줌. '됐어'라고 하면서 이미 차 시동 걸고 있음. 커뮤니티 공식 어른 담당.",
  },
  신: {
    name: "취향 확고 보석형",
    description: "꾸미는 게 곧 자기표현. 향수·주얼리·플레이리스트 전부 큐레이션 완료. 근데 애인 선물 고를 때 제일 진심임.",
  },
  임: {
    name: "속을 알 수 없는 바다형",
    description: "미스터리한 매력으로 다들 한 번씩 설레게 만듦. 본인은 그냥 가만히 있었을 뿐. 연락 텀이 길어도 마음이 식은 게 아님 — 원래 바다는 깊음.",
  },
  계: {
    name: "섬세한 이슬비형",
    description: "상대의 기분 변화를 제일 먼저 알아채는 관찰자. '너 오늘 무슨 일 있었지'를 카톡 말투만 보고 맞힘. 감수성 만렙, 눈물버튼도 만렙.",
  },
};

export function lesType(saju: SajuResult): LesType {
  return DAY_MASTER_TYPE[saju.dayMaster.stem];
}

// ---------- 신살 재해석 ----------

export interface Shinsal {
  name: string;
  emoji: string;
  description: string;
}

// 홍염살: 일간 → 지지 (통용 표 기준)
const HONGYEOM: Record<string, string> = {
  갑: "오", 을: "신", 병: "인", 정: "미", 무: "진",
  기: "진", 경: "술", 신: "유", 임: "자", 계: "신",
};

export function shinsals(saju: SajuResult): Shinsal[] {
  const { year, month, day, time } = saju.pillars;
  const pillars = [year, month, day, time].filter((p): p is Pillar => p !== null);
  const branches = pillars.map((p) => p.branch);
  const found: Shinsal[] = [];

  if (branches.some((b) => ["자", "오", "묘", "유"].includes(b))) {
    found.push({
      name: "도화살",
      emoji: "🌸",
      description: "여자한테 인기 많은 살. 퀴어 모임 가면 꼭 누가 인스타 아이디 물어봄. 본인은 '나 인기 없는데?'라고 함 — 그게 도화살의 완성입니다.",
    });
  }
  if (branches.some((b) => ["인", "신", "사", "해"].includes(b))) {
    found.push({
      name: "역마살",
      emoji: "✈️",
      description: "퀴퍼 원정살. 서울퀴퍼로는 부족해서 대구·부산·제주퀴퍼까지 감. 여행 가서 현지 레즈바 찾는 검색 실력이 프로급.",
    });
  }
  if (branches.some((b) => ["진", "술", "축", "미"].includes(b))) {
    found.push({
      name: "화개살",
      emoji: "🎨",
      description: "집순이 예술가 살. 데이트 코스가 전시회→독립책방→조용한 카페로 고정됨. 플레이리스트 공유가 곧 애정표현.",
    });
  }
  if (branches.includes(HONGYEOM[saju.dayMaster.stem])) {
    found.push({
      name: "홍염살",
      emoji: "🍷",
      description: "은은하게 사람 홀리는 살. 도화살이 직사광선이라면 홍염살은 무드등. 본인만 자기 매력을 모르고, 주변은 이미 다 알고 있음.",
    });
  }

  if (found.length === 0) {
    found.push({
      name: "무살(無殺) 클린 사주",
      emoji: "🧼",
      description: "신살이 하나도 없는 담백한 사주. 화려한 밀당 대신 진국의 정공법으로 승부하는 타입 — 오래 만날수록 진가가 나옴.",
    });
  }
  return found;
}

// ---------- 애인 찾을 스팟 추천 (오행 + 신살 기반) ----------
// 레즈비언만 아는 재미 포인트 코너. 특정 업소 실명 대신 커뮤니티가 다 아는
// '그런 곳' 카테고리로 추천한다 (폐업·정보 노후 리스크 회피).

export interface HuntingSpot {
  headline: string;
  spots: string[];
  bonus: string | null; // 신살 보너스 코멘트
}

const ELEMENT_SPOTS: Record<Element, { headline: string; spots: string[] }> = {
  목: {
    headline: "몸 쓰는 데서 눈 맞는 사주",
    spots: [
      "클라이밍장 — 국룰입니다. 초크백 매고 계세요. 볼더링 문제 하나 물어보는 게 곧 번호 교환",
      "여성 풋살 동호회 — 패스 궁합이 연애 궁합 되는 건 시간문제 (자매 서비스 FS SAJU가 증명함)",
      "한강 러닝크루 — 같은 페이스로 뛰는 사람이 있다? 그게 인연입니다",
    ],
  },
  화: {
    headline: "불금에 강한 사주",
    spots: [
      "레즈클럽 새벽 1시 — 화 기운은 무대 중앙에서 빛납니다. 가만히 서 있지 마세요",
      "퀴어 여성 파티·DJ 이벤트 — 인스타 스토리 품앗이하다가 DM으로 이어지는 코스",
      "퀴퍼 애프터파티 — 본 행사보다 애프터가 진짜인 거 아시죠",
    ],
  },
  토: {
    headline: "단골로 승부하는 사주",
    spots: [
      "동네 레즈바 단골석 — 토 기운은 화려한 헌팅보다 '자주 마주치는 사람'이 됩니다",
      "퀴어 여성 보드게임·독서 모임 — 3주 연속 같은 모임에 나가세요. 4주차에 일이 생깁니다",
      "고양이 보호소 봉사 — 임보 인계하다가 연락처 인계되는 정석 루트",
    ],
  },
  금: {
    headline: "취향으로 저격하는 사주",
    spots: [
      "전시회 오프닝·독립영화 GV — 금 기운의 확고한 취향은 그 자체가 프로필입니다",
      "레코드샵·LP바 — '이 앨범 좋아하세요?' 한 마디면 끝나는 사주",
      "위스키·와인바 조용한 자리 — 시끄러운 클럽보다 낮은 조도에서 승률이 높음",
    ],
  },
  수: {
    headline: "심야에 깊어지는 사주",
    spots: [
      "독립서점 퀴어 북토크 — 질문 하나 잘 던지면 뒤풀이까지 직행",
      "심야 카페·바 구석 자리 — 수 기운은 첫 만남보다 두 번째 대화에서 이깁니다",
      "온라인 커뮤니티 글쓰기 — 문장으로 홀리는 타입. 오프 모임 공지 뜨면 바로 신청하세요",
    ],
  },
};

export function huntingSpot(saju: SajuResult): HuntingSpot {
  const base = ELEMENT_SPOTS[saju.dominantElement];
  const sals = shinsals(saju).map((s) => s.name);

  const bonus = sals.includes("역마살")
    ? "역마살 보유자 — 지역퀴퍼 원정을 추천합니다. 판이 바뀌면 확률도 바뀝니다."
    : sals.includes("도화살")
      ? "도화살 보유자 — 사실 어디를 가든 상대가 먼저 옵니다. 위 장소에 '있기만' 하세요."
      : sals.includes("홍염살")
        ? "홍염살 보유자 — 조명 어두운 곳일수록 매력이 증폭됩니다. 무드등 있는 곳으로."
        : null;

  return { headline: base.headline, spots: base.spots, bonus };
}

// ---------- 유홀(U-Haul) 지수 ----------
// "만난 지 한 달 만에 이사 트럭 부르는" 그 기질을 수치화한다.
// 토(안정 지향)와 인성(정착·수용)이 높을수록, 역마살이 없을수록 상승.

export interface UhaulIndex {
  percent: number; // 0~100
  comment: string;
}

export function uhaulIndex(saju: SajuResult): UhaulIndex {
  const tg = tenGodCounts(saju);
  let percent =
    30 +
    saju.elementCounts.토 * 8 +
    tg.인성 * 10 +
    tg.비겁 * -5;

  const branches = [
    saju.pillars.year,
    saju.pillars.month,
    saju.pillars.day,
    saju.pillars.time,
  ]
    .filter((p): p is Pillar => p !== null)
    .map((p) => p.branch);
  if (branches.some((b) => ["인", "신", "사", "해"].includes(b))) percent -= 15;

  percent = Math.max(5, Math.min(98, Math.round(percent)));

  const comment =
    percent >= 75
      ? "만난 지 한 달째에 칫솔이, 두 달째에 고양이가, 세 달째에 이사 트럭이 옵니다. 부동산 앱을 이미 깔아뒀을 확률 높음."
      : percent >= 50
        ? "동거 욕구는 충분한데 자기 공간도 소중한 타입. 반동거(주 4일 합숙)로 타협할 사주입니다."
        : percent >= 30
          ? "각자의 집이 있어야 사랑도 오래 가는 타입. 애인의 유홀 기질을 만나면 협상 필수."
          : "독립성이 생명인 사주. 동거 얘기가 나오면 일단 여행부터 같이 가보자고 하세요.";

  return { percent, comment };
}

// ---------- 결과 종합 ----------

export interface LesReport {
  spectrum: Spectrum;
  male: MaleAudit;
  type: LesType;
  shinsals: Shinsal[];
  tenGods: TenGodCounts;
  hunting: HuntingSpot;
  uhaul: UhaulIndex;
}

export function buildReport(saju: SajuResult): LesReport {
  return {
    spectrum: spectrum(saju),
    male: maleAudit(saju),
    type: lesType(saju),
    shinsals: shinsals(saju),
    tenGods: tenGodCounts(saju),
    hunting: huntingSpot(saju),
    uhaul: uhaulIndex(saju),
  };
}
