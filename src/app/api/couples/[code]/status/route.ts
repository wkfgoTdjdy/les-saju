import { NextResponse } from "next/server";
import { getCoupleByCode } from "@/lib/db";

/** 완성 여부만 알려주는 폴링용 엔드포인트 — 개인정보는 내려주지 않는다. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const couple = await getCoupleByCode(code);
  if (!couple) {
    return NextResponse.json({ error: "존재하지 않는 초대예요." }, { status: 404 });
  }
  return NextResponse.json({ completed: Boolean(couple.completed_at) });
}
