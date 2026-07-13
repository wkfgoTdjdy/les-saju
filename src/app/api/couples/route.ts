import { NextResponse } from "next/server";
import { createCouple, completeCouple } from "@/lib/db";
import { parsePerson } from "@/lib/validate";
import { analyzeCouple } from "@/lib/llm";

/**
 * 커플 생성.
 * - body.a만 있으면: 초대 링크용 커플 생성 (애인이 /couple/join/[code]에서 완성)
 * - body.b도 있으면: 즉시 AI 분석까지 완료 (직접 입력 모드)
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const { a, b } = (body ?? {}) as { a?: unknown; b?: unknown };

  try {
    const personA = parsePerson(a, "나");
    const couple = await createCouple(personA);

    if (b !== undefined && b !== null) {
      const personB = parsePerson(b, "애인");
      const report = await analyzeCouple(personA, personB);
      const completed = await completeCouple(couple.code, personB, report);
      if (!completed) {
        return NextResponse.json({ error: "궁합 생성에 실패했습니다." }, { status: 500 });
      }
      return NextResponse.json({ code: couple.code, completed: true });
    }

    return NextResponse.json({ code: couple.code, completed: false });
  } catch (e) {
    const message = e instanceof Error ? e.message : "요청을 처리할 수 없습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
