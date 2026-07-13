import { NextResponse } from "next/server";
import { getCoupleByCode, completeCouple } from "@/lib/db";
import { parsePerson } from "@/lib/validate";
import { analyzeCouple } from "@/lib/llm";

/**
 * 초대받은 쪽(B)이 자기 정보를 입력해 커플 궁합을 완성한다.
 * 커플 사주는 1회만 가능 — 이미 완성된 초대는 409로 거절한다.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const couple = await getCoupleByCode(code);
  if (!couple) {
    return NextResponse.json({ error: "존재하지 않는 초대예요." }, { status: 404 });
  }
  if (couple.completed_at) {
    return NextResponse.json(
      { error: "이미 사용된 초대예요. 커플 사주는 1회만 볼 수 있어요." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const personB = parsePerson((body as { b?: unknown })?.b, "나");
    const personA = {
      name: couple.a_name,
      birth_date: couple.a_birth_date,
      birth_time: couple.a_birth_time,
      calendar: couple.a_calendar,
    };
    const report = await analyzeCouple(personA, personB);

    // completeCouple이 원자적으로 1회를 보장한다 — 동시 요청이 와도 한 번만 완성된다
    const completed = await completeCouple(code, personB, report);
    if (!completed) {
      return NextResponse.json(
        { error: "이미 사용된 초대예요. 커플 사주는 1회만 볼 수 있어요." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "요청을 처리할 수 없습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
