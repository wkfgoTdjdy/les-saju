// API 입력 검증 — 커플 궁합에서 받는 사람 정보(닉네임/생년월일/시간/달력)만 다룬다.
import { CalendarType, calculateSaju } from "./saju";
import type { CouplePerson } from "./db";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const CALENDARS = new Set(["solar", "lunar", "lunar_leap"]);

/**
 * 요청 본문의 한 사람 분량을 검증해 CouplePerson으로 정규화한다.
 * 실패하면 사용자에게 보여줄 한국어 메시지를 담아 던진다.
 */
export function parsePerson(raw: unknown, label: string): CouplePerson {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(`${label}의 정보가 없습니다.`);
  }
  const r = raw as Record<string, unknown>;

  const birthDate = typeof r.birthDate === "string" ? r.birthDate : "";
  if (!DATE_RE.test(birthDate)) {
    throw new Error(`${label}의 생년월일 형식이 올바르지 않습니다.`);
  }

  const birthTime =
    typeof r.birthTime === "string" && TIME_RE.test(r.birthTime) ? r.birthTime : null;

  const calendar =
    typeof r.calendar === "string" && CALENDARS.has(r.calendar) ? r.calendar : "solar";

  const name =
    typeof r.name === "string" && r.name.trim() ? r.name.trim().slice(0, 20) : null;

  // 존재하지 않는 음력 날짜 등은 여기서 걸러 400으로 돌려준다
  try {
    calculateSaju(birthDate, birthTime, calendar as CalendarType);
  } catch {
    throw new Error(
      `${label}의 날짜를 계산할 수 없습니다. 음력이라면 존재하는 날짜인지 확인해주세요.`
    );
  }

  return { name, birth_date: birthDate, birth_time: birthTime, calendar };
}
