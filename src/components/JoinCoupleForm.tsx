"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PersonFields, { PersonInput, EMPTY_PERSON } from "@/components/PersonFields";

/** 초대받은 쪽(B)의 입력 폼 — 제출하면 AI 분석과 함께 커플이 완성된다 (1회 제한). */
export default function JoinCoupleForm({ code }: { code: string }) {
  const router = useRouter();
  const [me, setMe] = useState<PersonInput>(EMPTY_PERSON);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me.date) {
      setError("생년월일을 입력해주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/couples/${code}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          b: {
            name: me.nickname,
            birthDate: me.date,
            birthTime: me.time || null,
            calendar: me.calendar,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "궁합을 완성하지 못했어요.");
      router.push(`/couple/result/${code}`);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "궁합을 완성하지 못했어요.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <PersonFields value={me} onChange={setMe} />
      {error && <p className="text-sm font-semibold text-sunset-deep">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-sunset via-rose-soft to-rose-deep px-6 py-4 text-lg font-extrabold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "AI가 둘의 궁합을 읽는 중… 🔮" : "우리 궁합 확인하기 →"}
      </button>
      <p className="text-center text-xs leading-relaxed text-rose">
        🔒 저장되는 건 두 사람의 생년월일과 닉네임뿐이에요. 이 궁합은 딱 한 번만 만들 수
        있어요.
      </p>
    </form>
  );
}
