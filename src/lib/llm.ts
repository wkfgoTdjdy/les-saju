// LLM 커플 궁합 해석.
// 사주 계산(만세력·십신·신살·궁합 점수)은 코드에서 정확히 끝내고, LLM에는 계산된 값을
// 주고 연애 맥락의 해석만 맡긴다. GEMINI_API_KEY가 없으면 미리보기 리포트를 반환한다.
import { GoogleGenAI } from "@google/genai";
import { calculateSaju, formatPillars, CalendarType, CALENDAR_LABEL, SajuResult } from "./saju";
import { tenGodCounts, spectrum, maleAudit, shinsals, lesType } from "./les";
import { buildCoupleReport, Person, CoupleReport } from "./couple";
import type { CouplePerson } from "./db";

export function toPerson(p: CouplePerson, fallbackName: string): Person {
  return {
    name: p.name ?? fallbackName,
    saju: calculateSaju(p.birth_date, p.birth_time, p.calendar as CalendarType),
  };
}

function personBrief(p: Person, raw: CouplePerson): string {
  const s = p.saju;
  const tg = tenGodCounts(s);
  const sp = spectrum(s);
  const counts = Object.entries(s.elementCounts)
    .map(([e, c]) => `${e}${c}`)
    .join(" ");
  return [
    `- ${p.name} (${CALENDAR_LABEL[raw.calendar as CalendarType]} ${raw.birth_date}${raw.birth_time ? ` ${raw.birth_time}` : ", 시간 미상"})`,
    `  사주: ${formatPillars(s)} / ${s.animal}띠 / 일간: ${s.dayMaster.stem}(${s.dayMaster.yinYang}${s.dayMaster.element})`,
    `  오행: ${counts} / 십신: 비겁${tg.비겁} 식상${tg.식상} 재성${tg.재성} 관성${tg.관성} 인성${tg.인성}`,
    `  유형: ${lesType(s).name} / 팸-부치 스펙트럼: ${sp.zone}(${sp.score}) / 신살: ${shinsals(s).map((x) => x.name).join(", ")}`,
    `  남성운 정산: ${maleAudit(s).headline}`,
  ].join("\n");
}

/**
 * 커플 AI 해석 리포트(마크다운) 생성. 키가 없으면 계산값 기반 미리보기를 반환한다.
 * 반환된 문자열은 couples.report에 저장된다 — 1회 제한이므로 재생성되지 않는다.
 */
export async function analyzeCouple(
  aRaw: CouplePerson,
  bRaw: CouplePerson
): Promise<string> {
  const a = toPerson(aRaw, "A");
  const b = toPerson(bRaw, "B");
  const report = buildCoupleReport(a, b);

  const prompt = `당신은 사주명리학에 정통하고 퀴어 감수성이 뛰어난 연애 상담가입니다.
아래는 레즈비언 커플 "${a.name} ♥ ${b.name}"의 사주 데이터입니다. 만세력 계산은 이미 정확히 끝난 값이므로 그대로 사용하세요.

## 워딩 원칙 (반드시 지킬 것)
- "남편" 등 이성애 전제 워딩 금지. 관성은 남성이 아니라 커리어·카리스마로 해석.
- 셀프디스가 아니라 셀프축하 톤. 커뮤니티 내부에서 낄낄대는 유머, 밖에서 소비하는 시선 금지.
- 팸/부치 표현은 재미 요소일 뿐 사람을 가두지 않게 — 반전 디테일을 섞을 것.

## 두 사람의 사주
${personBrief(a, aRaw)}
${personBrief(b, bRaw)}

## 계산된 궁합 (코드에서 결정적으로 산출된 값)
- 케미 점수: ${report.chemistry.score}점 (${report.chemistry.label}, 관계 유형: ${report.chemistry.relationType})
- 근거: ${report.chemistry.reasons.join("; ") || "특이 관계 없음"}
- 싸움 패턴: ${a.name} → ${report.fight.a} / ${b.name} → ${report.fight.b} / 조합 특성: ${report.fight.note}
- 먼저 연락하는 쪽: ${report.contact.winner ?? "동시"} — ${report.contact.comment}
- 동거(유홀) 지수: ${report.cohabit.percent}% (먼저 부동산 앱을 켜는 쪽: ${report.cohabit.mover})
- 고양이 입양 예상: ${report.cat.count}마리 — ${report.cat.comment}
- 전 애인의 전 애인일 확률: ${report.smallWorld.percent}%

## 요청
다음 구성으로 마크다운 리포트를 한국어로 작성하세요. 재미있고 생동감 있게, 그러나 실제 사주 데이터(일간, 오행, 십신, 신살)를 구체적으로 인용하며 근거를 대세요.

# 🌈 ${a.name} ♥ ${b.name} 커플 사주
## 총평 — 두 사람의 케미를 한 문단으로 (계산된 점수와 관계 유형 인용)
## 서로에게 끌린 이유 — 각자의 사주 기질이 상대의 어떤 부분을 채우는지
## 싸울 때 매뉴얼 — 싸움 패턴 분석과 구체적인 화해 프로토콜 (유쾌하게)
## 함께하는 미래 — 동거 지수·고양이 입양 예상을 엮은 생활 시뮬레이션
## 이 커플에게 한마디 — 따뜻하고 웃긴 응원으로 마무리`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.endsWith("...")) {
    return mockReport(a, b, report);
  }

  const ai = new GoogleGenAI({ apiKey });
  const text = await generateWithFallback(ai, prompt);
  if (!text) throw new Error("LLM 응답이 비어 있습니다");
  return text;
}

// 구버전 모델이 신규 계정에 막히는 경우(404)가 있어 후보를 순서대로 시도한다.
// GEMINI_MODEL이 설정되어 있으면 그것을 최우선으로.
const MODEL_CANDIDATES = [
  ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
  "gemini-flash-latest",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
];

async function generateWithFallback(ai: GoogleGenAI, prompt: string): Promise<string> {
  let lastError: unknown;
  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      if (response.text) return response.text;
    } catch (e) {
      lastError = e; // 404(모델 미지원) 등 — 다음 후보로
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("사용 가능한 Gemini 모델을 찾지 못했습니다. GEMINI_MODEL을 설정해보세요.");
}

function soloLine(name: string, s: SajuResult): string {
  const sp = spectrum(s);
  return `### ${name}\n일간 ${s.dayMaster.stem}(${s.dayMaster.yinYang}${s.dayMaster.element}), ${s.animal}띠 — **${lesType(s).name}**, 스펙트럼 좌표 **${sp.zone}**. ${formatPillars(s)}`;
}

function mockReport(a: Person, b: Person, report: CoupleReport): string {
  return `# 🌈 ${a.name} ♥ ${b.name} 커플 사주

> ⚠️ **미리보기 모드** — \`GEMINI_API_KEY\`가 설정되지 않아 계산된 궁합 데이터만 표시합니다. API 키를 설정하면 상세한 AI 해석 리포트가 생성됩니다.

## 케미 점수: ${report.chemistry.score}점 (${report.chemistry.label})

관계 유형 **${report.chemistry.relationType}** — ${report.chemistry.reasons.join(" / ") || "특이 관계 없음"}

## 두 사람

${soloLine(a.name, a.saju)}

${soloLine(b.name, b.saju)}

## 계산된 궁합 코너

- **싸울 때**: ${a.name}은 ${report.fight.a}, ${b.name}은 ${report.fight.b}. ${report.fight.note}
- **먼저 연락하는 쪽**: ${report.contact.comment}
- **동거(유홀) 지수 ${report.cohabit.percent}%**: ${report.cohabit.comment}
- **고양이 ${report.cat.count}마리 예정**: ${report.cat.comment}
- **전 애인의 전 애인일 확률 ${report.smallWorld.percent}%**: ${report.smallWorld.comment}
`;
}
