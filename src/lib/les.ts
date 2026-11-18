// LES SAJU 해석 로직 — 십신 분포, 팸-부치 스펙트럼, 남성운 정산, 신살 재해석.
// 전부 결정적 계산. 톤 원칙: 셀프디스가 아니라 셀프축하, 스테레오타입엔 반전 한 스푼.
import {
  SajuResult,
  Element,
  Pillar,
  GENERATES,
  CONTROLS,
  ELEMENTS,
  STEM_HAP,
} from "./saju";

export const EL_HANJA: Record<Element, string> = {
  목: "木", 화: "火", 토: "土", 금: "金", 수: "水",
};

// 받침 유무에 맞는 조사 — pair는 [받침 있을 때, 없을 때]
const josa = (word: string, pair: [string, string]) =>
  (word.charCodeAt(word.length - 1) - 0xac00) % 28 ? pair[0] : pair[1];

const clampPct = (n: number) => Math.max(5, Math.min(98, Math.round(n)));

function branchPillars(saju: SajuResult): Pillar[] {
  const { year, month, day, time } = saju.pillars;
  return [year, month, day, time].filter((p): p is Pillar => p !== null);
}

// ---------- 십신(十神) — 일간 기준 오행 관계 5분류 ----------
// 음양까지 나눈 10분류 대신 오행 단위 5분류를 쓴다 (해석 단순화).
// 비겁: 나와 같은 오행 / 식상: 내가 생하는 / 재성: 내가 극하는 /
// 관성: 나를 극하는 (전통 사주의 "남성운") / 인성: 나를 생하는

export type TenGod = "비겁" | "식상" | "재성" | "관성" | "인성";

export type TenGodCounts = Record<TenGod, number>;

/** 일간 오행(dm) 기준으로 다른 오행(el)이 어떤 십신인지 */
export function tenGodOf(dm: Element, el: Element): TenGod {
  if (el === dm) return "비겁";
  if (GENERATES[dm] === el) return "식상";
  if (CONTROLS[dm] === el) return "재성";
  if (CONTROLS[el] === dm) return "관성";
  return "인성";
}

export function tenGodCounts(saju: SajuResult): TenGodCounts {
  const dm = saju.dayMaster.element;
  const counts: TenGodCounts = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };

  const { year, month, day, time } = saju.pillars;
  const chars: Element[] = [];
  for (const p of [year, month, day, time]) {
    if (!p) continue;
    chars.push(p.stemElement, p.branchElement);
  }
  // 일간 자신은 제외 — 연·월 4자 다음이 일간이므로 항상 인덱스 4
  chars.splice(4, 1);

  for (const el of chars) counts[tenGodOf(dm, el)]++;
  return counts;
}

// ---------- 팸-부치 스펙트럼 ----------
// 좌표: -100(티부) ~ +100(온팸). 재미용 지표이며 사람을 가두는 라벨이 아니다 —
// 결과에는 항상 반전 디테일(twist)을 함께 낸다.

export interface Spectrum {
  score: number; // -100 ~ 100
  zone: "티부" | "소프트부치" | "전천후" | "소프트팸" | "온팸";
  tagline: string;
  twist: string; // 반전 한 스푼
  why: string; // 계산 근거
}

const ZONE_TAGLINE: Record<Spectrum["zone"], string> = {
  티부: "설명이 필요 없음. 공항 검색대에서 '저기요 손님' 소리 들어본 적 있는 기세.",
  소프트부치: "셔츠 소매 걷는 걸로 다 해먹는 타입. 본인은 꾸민 적 없다고 함.",
  전천후: "그날의 기분이 곧 정체성. 옷장에 슬랙스와 원피스가 사이좋게 걸려 있음.",
  소프트팸: "다정함이 기본값. 근데 운전대 잡으면 사람이 달라짐.",
  온팸: "풀메이크업은 자기표현이자 무기. 근데 좋아하는 사람 앞에서만 순해짐.",
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
    score < 60 ? "소프트팸" : "온팸";

  // 반전 디테일 — 스펙트럼 반대 방향 기운 중 가장 강한 것을 근거로
  const twist =
    zone === "티부" || zone === "소프트부치"
      ? tg.인성 >= 2
        ? "근데 인성이 발달해서, 애인이 아프면 죽 끓여서 달려가는 극진한 간호사 모드가 숨어 있음."
        : tg.식상 >= 2
          ? "근데 식상이 살아 있어서, 술자리에서 제일 웃긴 사람은 결국 이 사람임."
          : "근데 무서운 영화는 못 봄."
      : zone === "소프트팸" || zone === "온팸"
        ? tg.비겁 >= 2
          ? "근데 비겁이 튼튼해서, 이사할 때 짐은 본인이 다 듦. 벌레도 본인이 잡음."
          : tg.재성 >= 2
            ? "근데 재성이 발달해서, 데이트 코스 예약과 결제는 이미 끝나 있음."
            : "근데 팔씨름은 의외로 잘함."
        : "오늘은 부치, 내일은 팸. 정하는 건 언제나 본인임.";

  const yang = saju.dayMaster.yinYang === "양";
  const why =
    `십신 분포는 비겁 ${tg.비겁} · 식상 ${tg.식상} · 재성 ${tg.재성} · 관성 ${tg.관성} · 인성 ${tg.인성}. ` +
    "비겁·재성(주체성·쟁취)은 부치 쪽으로, 식상·인성(표현·수용)은 팸 쪽으로 좌표를 당깁니다. " +
    `일간이 ${yang ? "양" : "음"}간이라 ${yang ? "부치" : "팸"} 쪽으로 한 칸 더 — ` +
    `합산 ${score}점 (-100 티부 ~ +100 온팸).`;

  return { score, zone, tagline: ZONE_TAGLINE[zone], twist, why };
}

// ---------- 남성운 정산 (관성 재해석) ----------
// 전통 사주가 관성을 '남성운'으로 읽는 걸 뒤집는 코너. "남편" 같은 이성애 전제 워딩은
// 쓰지 않는다 — "남성"으로 표기한다.

export interface MaleAudit {
  count: number;
  headline: string;
  body: string;
  why: string;
}

export function maleAudit(saju: SajuResult): MaleAudit {
  const count = tenGodCounts(saju).관성;
  const dm = saju.dayMaster.element;
  const gwan = ELEMENTS.find((el) => CONTROLS[el] === dm)!;
  const why =
    `관성은 나(일간 ${dm})를 극하는 오행, 즉 ${gwan}(${EL_HANJA[gwan]})입니다. ` +
    `일간을 뺀 나머지 글자 중 ${gwan} 기운이 ${count}개.`;
  if (count === 0) {
    return {
      why,
      count,
      headline: "🎉 축하합니다, 사주에 남성운이 없으시네요",
      body: "관성(전통 사주에서 '남성운'이라 우기는 그것)이 완전 공석입니다. 만세력이 이미 다 알고 있었다는 뜻. 운명 감정 결과: 정상 영업 중.",
    };
  }
  if (count === 1) {
    return {
      why,
      count,
      headline: "관성 1개 발견 — 무시하셔도 됩니다",
      body: "전통 사주라면 '남성운'이라고 호들갑 떨었겠지만, 레즈 사주에서 관성 1개는 '마감 기한' 정도로 읽습니다. 일은 제때 하는 사주네요.",
    };
  }
  return {
    why,
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

// 일간 10종 — 유형 소개 페이지(/types/[slug])의 URL·표기용
export const DAY_MASTERS = [
  { slug: "gap", stem: "갑", hanja: "甲", element: "목", yinYang: "양" },
  { slug: "eul", stem: "을", hanja: "乙", element: "목", yinYang: "음" },
  { slug: "byeong", stem: "병", hanja: "丙", element: "화", yinYang: "양" },
  { slug: "jeong", stem: "정", hanja: "丁", element: "화", yinYang: "음" },
  { slug: "mu", stem: "무", hanja: "戊", element: "토", yinYang: "양" },
  { slug: "gi", stem: "기", hanja: "己", element: "토", yinYang: "음" },
  { slug: "gyeong", stem: "경", hanja: "庚", element: "금", yinYang: "양" },
  { slug: "sin", stem: "신", hanja: "辛", element: "금", yinYang: "음" },
  { slug: "im", stem: "임", hanja: "壬", element: "수", yinYang: "양" },
  { slug: "gye", stem: "계", hanja: "癸", element: "수", yinYang: "음" },
] as const satisfies readonly {
  slug: string; stem: string; hanja: string; element: Element; yinYang: "양" | "음";
}[];

export const DAY_MASTER_TYPE: Record<string, LesType> = {
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
  why: string;
}

// 홍염살: 일간 → 지지 (통용 표 기준)
const HONGYEOM: Record<string, string> = {
  갑: "오", 을: "신", 병: "인", 정: "미", 무: "진",
  기: "진", 경: "술", 신: "유", 임: "자", 계: "신",
};

export function shinsals(saju: SajuResult): Shinsal[] {
  const pillars = branchPillars(saju);
  const branches = pillars.map((p) => p.branch);
  const found: Shinsal[] = [];
  // 근거 문장: 해당 지지를 한자와 함께 보여준다
  const hits = (set: string[]) =>
    pillars
      .filter((p) => set.includes(p.branch))
      .map((p) => `${p.branch}(${p.hanja[1]})`)
      .join("·");

  if (branches.some((b) => ["자", "오", "묘", "유"].includes(b))) {
    found.push({
      name: "도화살",
      emoji: "🌸",
      description: "여자한테 인기 많은 살. 퀴어 모임 가면 꼭 누가 인스타 아이디 물어봄. 본인은 '나 인기 없는데?'라고 함 — 그게 도화살의 완성입니다.",
      why: `지지에 ${hits(["자", "오", "묘", "유"])} — 자·오·묘·유 중 하나가 있으면 도화살`,
    });
  }
  if (branches.some((b) => ["인", "신", "사", "해"].includes(b))) {
    found.push({
      name: "역마살",
      emoji: "✈️",
      description: "퀴퍼 원정살. 서울퀴퍼로는 부족해서 대구·부산·제주퀴퍼까지 감. 여행 가서 현지 레즈바 찾는 검색 실력이 프로급.",
      why: `지지에 ${hits(["인", "신", "사", "해"])} — 인·신·사·해 중 하나가 있으면 역마살`,
    });
  }
  if (branches.some((b) => ["진", "술", "축", "미"].includes(b))) {
    found.push({
      name: "화개살",
      emoji: "🎨",
      description: "집순이 예술가 살. 데이트 코스가 전시회→독립책방→조용한 카페로 고정됨. 플레이리스트 공유가 곧 애정표현.",
      why: `지지에 ${hits(["진", "술", "축", "미"])} — 진·술·축·미 중 하나가 있으면 화개살`,
    });
  }
  if (branches.includes(HONGYEOM[saju.dayMaster.stem])) {
    found.push({
      name: "홍염살",
      emoji: "🍷",
      description: "은은하게 사람 홀리는 살. 도화살이 직사광선이라면 홍염살은 무드등. 본인만 자기 매력을 모르고, 주변은 이미 다 알고 있음.",
      why: `${saju.dayMaster.stem} 일간에게는 지지 ${HONGYEOM[saju.dayMaster.stem]}가 홍염 — 사주에 그 글자가 있음`,
    });
  }

  if (found.length === 0) {
    found.push({
      name: "무살(無殺) 클린 사주",
      emoji: "🧼",
      description: "신살이 하나도 없는 담백한 사주. 화려한 밀당 대신 진국의 정공법으로 승부하는 타입 — 오래 만날수록 진가가 나옴.",
      why: "도화·역마·화개·홍염에 해당하는 지지가 하나도 없음",
    });
  }
  return found;
}

// ---------- 정체성 감정서 (재미용) ----------
// 관성(전통 사주의 '남성운')과 도화·홍염(사람을 가리지 않고 홀리는 기운)으로
// "혹시 바이? 이성애자 사주?"까지 장난스럽게 감정한다.
// 원칙: 어떤 판정이 나와도 셀프축하로 끝나고, 최종 결정권은 언제나 본인에게 있음을 명시.

export interface IdentityAudit {
  verdict: string;
  headline: string;
  body: string;
  why: string;
}

export function identityAudit(saju: SajuResult): IdentityAudit {
  const gwan = tenGodCounts(saju).관성;
  const sals = shinsals(saju).map((s) => s.name);
  const charm = (sals.includes("도화살") ? 1 : 0) + (sals.includes("홍염살") ? 1 : 0);
  const score = gwan * 2 + charm;
  const why =
    `관성 ${gwan}개 × 2점 + 도화·홍염 ${charm}점 = ${score}점. ` +
    "0점은 공인 레즈, 1~2점은 레즈, 3~4점은 바이 기운, 5점부터는 이성애자 사주(를 이긴 사람)로 감정합니다.";

  if (score <= 0) {
    return {
      why,
      verdict: "만세력 공인 레즈",
      headline: "🏳️‍🌈 감정 결과: 만세력 공인 레즈",
      body: "남성 기운과의 인연이 사주에 아예 없습니다. 서류상으로도, 실물로도 레즈. 만세력이 직인까지 찍어드렸어요.",
    };
  }
  if (score <= 2) {
    return {
      why,
      verdict: "레즈 (진단서 발급 완료)",
      headline: "✅ 감정 결과: 레즈, 이상 무",
      body: "미세한 남성운 흔적이 있으나 오차 범위 이내입니다. 판정: 레즈. 진단서는 이 페이지를 캡처하시면 됩니다.",
    };
  }
  if (score <= 4) {
    return {
      why,
      verdict: "바이 기운 감지",
      headline: "💜 감정 결과: 바이 기운 감지",
      body: "사주상 사람을 가리지 않고 끌어당기는 기운이 있어요. 바이일 가능성도 사주는 열어둡니다 — 어느 쪽이든 정하는 건 만세력이 아니라 본인입니다. 지금 여기 들어와 있는 게 가장 정확한 데이터고요.",
    };
  }
  return {
    why,
    verdict: "이성애자 사주?!",
    headline: "😱 감정 결과: 이성애자 사주…인데요?",
    body: "전통 사주 기준으로 남성운이 이렇게 강한데도 지금 이 사이트에 접속해 있는 당신 — 사주를 이겨버린 사람입니다. 운명보다 강한 게 취향이에요. 재검 불필요, 축하드립니다.",
  };
}

// ---------- 애인 찾을 스팟 추천 (오행 + 신살 기반) ----------
// 레즈비언만 아는 재미 포인트 코너. 특정 업소 실명 대신 커뮤니티가 다 아는
// '그런 곳' 카테고리로 추천한다 (폐업·정보 노후 리스크 회피).

export interface HuntingSpot {
  headline: string;
  spots: string[];
  bonus: string | null; // 신살 보너스 코멘트
  why: string;
}

export const ELEMENT_SPOTS: Record<Element, { headline: string; spots: string[] }> = {
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

  const el = saju.dominantElement;
  const why = `여덟 글자 중 ${el}(${EL_HANJA[el]}) 기운이 ${saju.elementCounts[el]}개로 가장 많아서, ${el} 기운이 빛나는 장소를 골랐습니다.`;

  return { headline: base.headline, spots: base.spots, bonus, why };
}

// ---------- 동거지수 (U-Haul 밈) ----------
// "만난 지 한 달 만에 이사 트럭 부르는" 그 기질을 수치화한다.
// 토(안정 지향)와 인성(정착·수용)이 높을수록, 역마살이 없을수록 상승.

export interface UhaulIndex {
  percent: number; // 0~100
  comment: string;
  why: string;
}

function hasYeokma(saju: SajuResult): boolean {
  return branchPillars(saju).some((p) => ["인", "신", "사", "해"].includes(p.branch));
}

export function uhaulIndex(saju: SajuResult): UhaulIndex {
  const tg = tenGodCounts(saju);
  let percent =
    30 +
    saju.elementCounts.토 * 8 +
    tg.인성 * 10 +
    tg.비겁 * -5;

  const yeokma = hasYeokma(saju);
  if (yeokma) percent -= 15;

  const raw = percent;
  percent = clampPct(percent);
  const why =
    `기본 30 + 토 ${saju.elementCounts.토}개×8 + 인성 ${tg.인성}개×10 − 비겁 ${tg.비겁}개×5` +
    `${yeokma ? " − 역마살 15" : ""} = ${raw}${raw !== percent ? ` → ${percent}%로 보정` : "%"}. ` +
    "토와 인성은 정착하려는 기운, 비겁은 내 공간을 지키려는 기운입니다.";

  const comment =
    percent >= 75
      ? "만난 지 한 달째에 칫솔이, 두 달째에 고양이가, 세 달째에 이사 트럭이 옵니다. 부동산 앱을 이미 깔아뒀을 확률 높음."
      : percent >= 50
        ? "동거 욕구는 충분한데 자기 공간도 소중한 타입. 반동거(주 4일 합숙)로 타협할 사주입니다."
        : percent >= 30
          ? "각자의 집이 있어야 사랑도 오래 가는 타입. 애인의 동거 돌진 기질을 만나면 협상 필수."
          : "독립성이 생명인 사주. 동거 얘기가 나오면 일단 여행부터 같이 가보자고 하세요.";

  return { percent, comment, why };
}

// ---------- 오행 밸런스 ----------

export interface ElementBalance {
  counts: Record<Element, number>;
  total: number;
  dominant: Element;
  lacking: Element[];
  dominantComment: string;
  lackingComment: string;
}

const DOMINANT_COMMENT: Record<Element, string> = {
  목: "목(木)이 우세 — 좋아하는 사람이 생기면 일단 자라나는 넝쿨처럼 다가가는 추진형. 관계를 키워가는 재능이 있고, 연애가 시작되면 상대의 세계까지 넓혀줍니다. 다만 상대의 속도를 기다려주는 연습이 필요해요.",
  화: "화(火)가 우세 — 감정이 크고 뜨겁게 타는 열정형. 좋아하면 온 우주에 티가 나고, 그 에너지가 사람을 끌어당깁니다. 식는 것도 빠를 수 있으니 '오래 타는 법'을 아는 상대를 만나면 무적.",
  토: "토(土)가 우세 — 쉽게 흔들리지 않는 안정형. 화려한 밀당보다 꾸준함으로 신뢰를 쌓고, 연애가 길어질수록 진가가 나옵니다. 장기연애·동거 적성 최상위권.",
  금: "금(金)이 우세 — 취향과 기준이 확고한 심미형. 아무나 만나지 않지만, 한번 정하면 그 사람에게 아낌없이 투자합니다. 결단력이 있어 관계의 중요한 순간마다 중심을 잡아줘요.",
  수: "수(水)가 우세 — 깊고 유연한 감성형. 상대의 마음을 읽는 촉이 좋고 대화의 밀도가 높습니다. 겉으론 잔잔해 보여도 속은 바다 — 그 깊이를 알아봐주는 사람과 만나면 오래 갑니다.",
};

const LACKING_COMMENT: Record<Element, string> = {
  목: "목(木) 부족 — 관계를 먼저 시작하는 추진력이 아쉬울 수 있어요. 마음에 드는 사람이 있으면 '다음에'를 금지어로 정하세요.",
  화: "화(火) 부족 — 표현이 은은한 편이라 상대가 눈치를 못 챌 수 있어요. 좋으면 좋다고 입 밖으로, 이모지라도 하나 더.",
  토: "토(土) 부족 — 관계가 뜨거울 땐 좋은데 정착 단계에서 불안해질 수 있어요. 토 기운 많은 상대를 만나면 신기하게 편안해집니다.",
  금: "금(金) 부족 — 끊어야 할 관계를 오래 붙잡는 경향이 있어요. 아닌 인연에는 냉정해도 됩니다. 그래야 맞는 인연이 들어와요.",
  수: "수(水) 부족 — 감정을 흘려보내는 힘이 약해 서운함이 쌓이기 쉬워요. 싸운 날은 자기 전에 풀고 자는 걸 규칙으로.",
};

export function elementBalance(saju: SajuResult): ElementBalance {
  const counts = saju.elementCounts;
  const total = ELEMENTS.reduce((sum, el) => sum + counts[el], 0);
  const lacking = saju.lackingElements;
  const scarcest = ELEMENTS.reduce((a, b) => (counts[b] < counts[a] ? b : a));

  return {
    counts,
    total,
    dominant: saju.dominantElement,
    lacking,
    dominantComment: DOMINANT_COMMENT[saju.dominantElement],
    lackingComment: lacking.length
      ? LACKING_COMMENT[lacking[0]] +
        (lacking.length > 1 ? ` (${lacking.slice(1).join("·")} 기운도 함께 부족)` : "")
      : `빠진 오행이 없는 풀세트 사주 — 밸런스형입니다. 대신 가장 약한 ${scarcest} 기운은 컨디션이 흔들릴 때 같이 흔들리니 알아두세요.`,
  };
}

// ---------- 연애 스타일 (일간 오행 × 음양) ----------

export interface LoveStyle {
  confess: string;
  contact: string;
  jealousy: string;
  date: string;
  tempo: string; // 음양에 따른 완급
}

const LOVE_STYLE: Record<Element, Omit<LoveStyle, "tempo">> = {
  목: {
    confess: "마음을 정하면 직진 — 밥 먹다 말고 '우리 사귈래?'가 나오는 타입.",
    contact: "아침 굿모닝 카톡 담당. 하루의 시작과 끝을 상대와 공유해야 직성이 풀림.",
    jealousy: "질투가 나면 말투가 한 톤 짧아짐. '어. 그래. 재밌었겠네.' — 이게 신호입니다.",
    date: "야외에서 빛나는 타입 — 등산, 자전거, 한강 피크닉. 같이 몸을 움직여야 정이 듦.",
  },
  화: {
    confess: "불꽃 고백형 — 꽃다발, 이벤트, 온 우주가 알게 되는 고백. 거절당해도 후회는 없음.",
    contact: "답장 3초컷. 대신 본인이 바쁘면 갑자기 잠수 — 식은 게 아니라 몰입 중인 것.",
    jealousy: "질투가 얼굴에 실시간으로 중계됨. 숨기질 못해서 오히려 귀엽다는 평.",
    date: "페스티벌, 콘서트, 새벽 드라이브 — 심장 뛰는 데이트가 곧 애정 확인.",
  },
  토: {
    confess: "고백까지 오래 걸리지만, 한번 하면 청혼급 무게. '나 진지해'가 디폴트.",
    contact: "매일 같은 시간에 오는 루틴형 연락. 화려하진 않지만 10년을 가는 스타일.",
    jealousy: "묵묵히 쌓아두다 한 번에 터지는 타입. 서운한 건 그때그때 물어봐 주세요.",
    date: "단골집 투어와 집 데이트의 장인. '우리 집에서 뭐 해 먹을까'가 최고의 데이트 신청.",
  },
  금: {
    confess: "계획된 고백 — 장소, 타이밍, 멘트까지 시나리오 완성 후 실행. 성공률이 높은 이유.",
    contact: "용건 위주의 연락인데, 그 용건을 매일 만들어냄. '이거 너 생각나서'가 주력 멘트.",
    jealousy: "질투를 논리로 포장함. '그 사람 좀 별로던데' = 질투 맞습니다.",
    date: "전시 오프닝, 팝업, 파인다이닝 — 취향으로 큐레이션한 데이트로 상대를 감동시킴.",
  },
  수: {
    confess: "고백인 듯 아닌 듯 스며드는 고백 — 정신 차려보면 이미 사귀고 있음.",
    contact: "새벽 감성 장문 카톡 담당. 낮에는 조용하다가 밤 11시 이후 말이 많아짐.",
    jealousy: "질투를 안 하는 척하면서 다 기억해뒀다가 몇 주 뒤에 조용히 꺼냄.",
    date: "심야 산책, 조용한 바, 비 오는 날 카페 — 둘만의 밀도 높은 대화가 곧 데이트.",
  },
};

export function loveStyleFor(element: Element, yinYang: "양" | "음"): LoveStyle {
  const base = LOVE_STYLE[element];
  const tempo =
    yinYang === "양"
      ? "양간이라 표현이 먼저 나가는 편 — 생각보다 말이 빠릅니다. 실수해도 그게 매력."
      : "음간이라 속으로 백 번 시뮬레이션한 뒤 실행하는 편 — 느려 보여도 이미 다 계획되어 있음.";
  return { ...base, tempo };
}

export function loveStyle(saju: SajuResult): LoveStyle {
  return loveStyleFor(saju.dayMaster.element, saju.dayMaster.yinYang);
}

// ---------- 올해의 연애운 (연간 천간 vs 일간) ----------

export interface YearlyLove {
  year: number;
  god: TenGod;
  headline: string;
  body: string;
  why: string;
}

const GOD_MEANING: Record<TenGod, string> = {
  비겁: "나와 같은 기운",
  식상: "내가 낳는 기운",
  재성: "내가 다스리는 기운",
  관성: "나를 다스리는 기운",
  인성: "나를 낳아주는 기운",
};

const YEAR_STEM_ELEMENT: Element[] = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];

const YEARLY_COMMENT: Record<TenGod, { headline: string; body: string }> = {
  비겁: {
    headline: "동지의 해 — 친구가 연인이 되는 클래식 루트",
    body: "올해는 나와 같은 기운이 들어오는 해. 동호회, 스터디, 운동 모임처럼 '같이 뭔가 하는 자리'에서 인연이 익어갑니다. 오래 알고 지낸 사람을 다시 보게 되는 사건이 생길 수 있어요 — 그 마음, 무시하지 마세요.",
  },
  식상: {
    headline: "매력 발산의 해 — 짝사랑 중이면 올해가 고백 타이밍",
    body: "표현력이 만개하는 해입니다. 평소보다 말이 잘 통하고, 웃기고, 빛나 보여요. 인스타 스토리 하나에도 DM이 올 수 있는 해 — 짝사랑을 품고 있다면 묵히지 말고 올해 안에 움직이세요.",
  },
  재성: {
    headline: "쟁취의 해 — 움직이면 잡히는 해",
    body: "원하는 것을 향해 움직이면 손에 들어오는 기운입니다. 소개팅 승률이 높고, 먼저 다가간 만큼 돌아와요. 데이트 코스도 주도적으로 짜보세요 — 올해의 당신은 리드가 어울립니다.",
  },
  관성: {
    headline: "커리어 폭발의 해 — 일하는 모습에 반할 사람이 옵니다",
    body: "일이 바빠지고 인정받는 해라 연애가 뒷전이 되기 쉬워요. 그런데 반전 — 몰입해서 일하는 모습이 올해 당신의 최대 매력 포인트입니다. 일터·프로젝트 근처에서 인연이 생길 수 있으니 회식과 네트워킹을 피하지 마세요.",
  },
  인성: {
    headline: "돌봄 받는 해 — 받는 연애를 연습하세요",
    body: "먼저 다가와주고, 챙겨주고, 기다려주는 사람이 나타나는 해입니다. 늘 주는 쪽이었다면 올해는 받는 연습을 하세요. '고마워' 한마디면 충분합니다 — 다 계획된 운세예요.",
  },
};

export function yearlyLove(saju: SajuResult, year: number): YearlyLove {
  const yearElement = YEAR_STEM_ELEMENT[(year - 4) % 10];
  const dm = saju.dayMaster.element;
  const god = tenGodOf(dm, yearElement);
  const why = `${year}년의 천간은 ${yearElement}(${EL_HANJA[yearElement]}) 기운. ${dm} 일간인 당신에게 ${yearElement}${josa(yearElement, ["은", "는"])} ${god} — ${GOD_MEANING[god]}입니다.`;

  return { year, god, ...YEARLY_COMMENT[god], why };
}

// ---------- 이상형: 나를 살리는 상대 ----------

export interface IdealType {
  element: Element;
  headline: string;
  body: string;
  types: string[]; // 어울리는 일간 유형 이름들
  why: string;
  // 천간합 상대 — 일간끼리 합이 드는 단 하나의 일간
  hap: { slug: string; label: string; name: string };
}

const STEMS_BY_ELEMENT: Record<Element, string[]> = {
  목: ["갑", "을"], 화: ["병", "정"], 토: ["무", "기"], 금: ["경", "신"], 수: ["임", "계"],
};

export function idealType(saju: SajuResult): IdealType {
  const dm = saju.dayMaster.element;
  // 나를 생(生)해주는 오행 — 함께 있으면 충전되는 기운
  const supporter = ELEMENTS.find((el) => GENERATES[el] === dm)!;
  const types = STEMS_BY_ELEMENT[supporter].map((s) => DAY_MASTER_TYPE[s].name);

  const myStem = saju.dayMaster.stem;
  const pair = STEM_HAP.find((h) => h.includes(myStem))!;
  const hap = DAY_MASTERS.find((d) => d.stem === (pair[0] === myStem ? pair[1] : pair[0]))!;

  const lackingNote = saju.lackingElements.length
    ? ` 그리고 당신에게 없는 ${saju.lackingElements.join("·")} 기운을 가진 사람도 운명 후보 — 처음엔 '나랑 너무 다른데?' 싶다가 어느 순간 없으면 안 되는 사람이 됩니다.`
    : " 오행이 고루 있는 사주라 웬만한 상대와 다 합이 맞는 편 — 결국 취향 싸움입니다.";

  return {
    element: supporter,
    headline: `당신을 살리는 오행은 ${supporter}(${EL_HANJA[supporter]})`,
    body: `${supporter} 기운의 상대와 있으면 이유 없이 충전되고, 지쳤을 때 제일 먼저 생각납니다. 유형으로 치면 '${types.join("' 또는 '")}' 같은 사람.${lackingNote}`,
    types,
    why: `${supporter}生${dm} — ${supporter}(${EL_HANJA[supporter]})${josa(supporter, ["이", "가"])} ${dm}(${EL_HANJA[dm]})${josa(dm, ["을", "를"])} 낳아주는 상생 관계라서, ${supporter} 기운 곁에서 일간이 힘을 얻습니다.`,
    hap: { slug: hap.slug, label: `${hap.stem}${hap.element}`, name: DAY_MASTER_TYPE[hap.stem].name },
  };
}

// ---------- 밈 지수 3종 (재미용) ----------
// 커뮤니티 단골 밈을 수치화한다. 높든 낮든 축하로 끝나는 게 원칙.

export interface MemeIndex {
  name: string;
  percent: number;
  comment: string;
  why: string;
}

export function memeIndexes(saju: SajuResult): MemeIndex[] {
  const tg = tenGodCounts(saju);
  const el = saju.elementCounts;
  const yeokma = hasYeokma(saju);

  const ex = clampPct(30 + tg.비겁 * 12 + el.수 * 6 - el.금 * 8);
  const radar = clampPct(40 + el.수 * 8 + tg.식상 * 8 - el.토 * 8);
  const distance = clampPct(35 + (yeokma ? 20 : 0) + tg.비겁 * 8 + el.금 * 5 - el.화 * 8);

  return [
    {
      name: "전애인과 친구로 남을 확률",
      percent: ex,
      comment:
        ex >= 65
          ? "전애인의 현애인과도 친구인 사주. 생일 파티 단체사진이 사실상 연애사 연표입니다 — 그게 이 커뮤니티의 저력이죠."
          : ex >= 40
            ? "친구로 남긴 하는데 1년의 숙성 기간이 필요한 타입. 그 뒤엔 누구보다 든든한 사이가 됩니다."
            : "끝나면 깔끔하게 끝. 미련 없는 정리 실력 덕분에 다음 연애가 늘 새것처럼 시작됩니다.",
      why: `기본 30 + 비겁 ${tg.비겁}개×12(동지애) + 수 ${el.수}개×6(흘려보내는 힘) − 금 ${el.금}개×8(칼같은 정리)`,
    },
    {
      name: "플러팅 눈치",
      percent: radar,
      comment:
        radar >= 65
          ? "상대가 마음먹기도 전에 이미 알고 있음. 모르는 척해주는 것까지가 이 사주의 매너입니다."
          : radar >= 40
            ? "세 번쯤 신호를 받으면 알아챕니다. 주변에서 '쟤 너 좋아해'라고 말해주면 확정."
            : "3년 뒤에 '그때 그게 플러팅이었어?' 하는 타입. 대신 이 무해함에 다들 더 빠져듭니다.",
      why: `기본 40 + 수 ${el.수}개×8(촉) + 식상 ${tg.식상}개×8(끼) − 토 ${el.토}개×8(우직함)`,
    },
    {
      name: "장거리 연애 내성",
      percent: distance,
      comment:
        distance >= 65
          ? "KTX 정기권이 곧 러브레터. 떨어져 있는 시간에 각자 더 멋있어져서 만나는 사주입니다."
          : distance >= 40
            ? "격주 만남까지는 거뜬. 영상통화 켜놓고 각자 할 일 하는 게 최고의 데이트."
            : "보고 싶으면 지금 봐야 하는 사주. 그 직진 덕분에 장거리가 금방 근거리가 됩니다.",
      why: `기본 35${yeokma ? " + 역마살 20" : ""} + 비겁 ${tg.비겁}개×8(독립성) + 금 ${el.금}개×5(결단) − 화 ${el.화}개×8(지금 당장 보고 싶음)`,
    },
  ];
}

// ---------- 결과 종합 ----------

export interface LesReport {
  spectrum: Spectrum;
  male: MaleAudit;
  identity: IdentityAudit;
  type: LesType;
  shinsals: Shinsal[];
  tenGods: TenGodCounts;
  balance: ElementBalance;
  love: LoveStyle;
  yearly: YearlyLove;
  ideal: IdealType;
  hunting: HuntingSpot;
  uhaul: UhaulIndex;
  memes: MemeIndex[];
}

export function buildReport(
  saju: SajuResult,
  year: number = new Date().getFullYear()
): LesReport {
  return {
    spectrum: spectrum(saju),
    male: maleAudit(saju),
    identity: identityAudit(saju),
    type: lesType(saju),
    shinsals: shinsals(saju),
    tenGods: tenGodCounts(saju),
    balance: elementBalance(saju),
    love: loveStyle(saju),
    yearly: yearlyLove(saju, year),
    ideal: idealType(saju),
    hunting: huntingSpot(saju),
    uhaul: uhaulIndex(saju),
    memes: memeIndexes(saju),
  };
}
