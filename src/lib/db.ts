// 데이터 저장 레이어 — 커플 궁합 전용.
// 저장하는 것은 생년월일·닉네임뿐이다 (프라이버시 원칙). 솔로 사주는 아무것도 저장하지 않는다.
// SUPABASE 환경변수가 설정되어 있으면 Supabase를, 없으면 인메모리 저장소를 사용한다.
// (인메모리는 로컬 개발용 — 서버 재시작 시 데이터가 사라진다)
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { customAlphabet } from "nanoid";

const generateCode = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

export interface CouplePerson {
  name: string | null;
  birth_date: string; // YYYY-MM-DD
  birth_time: string | null; // HH:mm
  calendar: string; // solar | lunar | lunar_leap
}

export interface Couple {
  id: string;
  code: string;
  a_name: string | null;
  a_birth_date: string;
  a_birth_time: string | null;
  a_calendar: string;
  b_name: string | null;
  b_birth_date: string | null;
  b_birth_time: string | null;
  b_calendar: string | null;
  report: string | null; // AI 해석 리포트 (완성 시)
  completed_at: string | null; // 완성 시각 — 값이 있으면 이 초대는 소진된 것
  created_at: string;
}

// 플레이스홀더나 URL이 아닌 값이 들어 있으면 미설정으로 간주하고 인메모리로 폴백한다.
function resolveSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (url.includes("xxxx") || key === "eyJ..." || key === "sb_secret_...") return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { url, key };
}

function getSupabase(): SupabaseClient | null {
  const config = resolveSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key, { auth: { persistSession: false } });
}

export const usingMemoryStore = !resolveSupabaseConfig();

// ---------- 인메모리 폴백 ----------
const g = globalThis as unknown as { __lesSajuCouples?: Map<string, Couple> };
function memStore(): Map<string, Couple> {
  g.__lesSajuCouples ??= new Map();
  return g.__lesSajuCouples;
}
let memId = 0;

// ---------- 공개 API ----------

export async function createCouple(a: CouplePerson): Promise<Couple> {
  const code = generateCode();
  const supabase = getSupabase();

  if (!supabase) {
    const couple: Couple = {
      id: `mem-${++memId}-${code}`,
      code,
      a_name: a.name,
      a_birth_date: a.birth_date,
      a_birth_time: a.birth_time,
      a_calendar: a.calendar,
      b_name: null,
      b_birth_date: null,
      b_birth_time: null,
      b_calendar: null,
      report: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    memStore().set(code, couple);
    return couple;
  }

  const { data, error } = await supabase
    .from("couples")
    .insert({
      code,
      a_name: a.name,
      a_birth_date: a.birth_date,
      a_birth_time: a.birth_time,
      a_calendar: a.calendar,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Couple;
}

export async function getCoupleByCode(code: string): Promise<Couple | null> {
  const supabase = getSupabase();
  if (!supabase) return memStore().get(code) ?? null;

  const { data, error } = await supabase
    .from("couples")
    .select()
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return (data as Couple) ?? null;
}

/**
 * 커플 완성 — 1회 제한의 핵심. 이미 완성된(completed_at이 있는) 커플이면
 * 아무것도 바꾸지 않고 null을 반환한다.
 */
export async function completeCouple(
  code: string,
  b: CouplePerson,
  report: string
): Promise<Couple | null> {
  const supabase = getSupabase();
  const completedAt = new Date().toISOString();

  if (!supabase) {
    const couple = memStore().get(code);
    if (!couple || couple.completed_at) return null;
    Object.assign(couple, {
      b_name: b.name,
      b_birth_date: b.birth_date,
      b_birth_time: b.birth_time,
      b_calendar: b.calendar,
      report,
      completed_at: completedAt,
    });
    return couple;
  }

  // completed_at이 null인 행만 갱신 — 이미 완성됐으면 0행 매치로 null이 돌아온다 (원자적 1회 보장)
  const { data, error } = await supabase
    .from("couples")
    .update({
      b_name: b.name,
      b_birth_date: b.birth_date,
      b_birth_time: b.birth_time,
      b_calendar: b.calendar,
      report,
      completed_at: completedAt,
    })
    .eq("code", code)
    .is("completed_at", null)
    .select()
    .maybeSingle();
  if (error) throw error;
  return (data as Couple) ?? null;
}
