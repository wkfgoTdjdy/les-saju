"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PersonFields, { PersonInput, EMPTY_PERSON } from "@/components/PersonFields";
import WaitForCompletion from "@/components/WaitForCompletion";

function toPayload(p: PersonInput) {
  return {
    name: p.nickname,
    birthDate: p.date,
    birthTime: p.time || null,
    calendar: p.calendar,
  };
}

/**
 * 커플 궁합 시작 폼.
 * - 초대 모드: 내 정보로 초대 코드를 만들어 애인에게 링크 전달 (애인이 생일 입력 시 완성)
 * - 직접 모드: 둘 다의 생일을 알면 바로 AI 분석까지 완료
 * 커플 사주는 초대 1건당 1회만 볼 수 있다.
 */
export default function CoupleForm() {
  const router = useRouter();
  const [me, setMe] = useState<PersonInput>(EMPTY_PERSON);
  const [partner, setPartner] = useState<PersonInput>(EMPTY_PERSON);
  const [direct, setDirect] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function makeInvite() {
    if (!me.date) {
      setError("내 생년월일을 입력해주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/couples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: toPayload(me) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "초대를 만들지 못했어요.");
      setInviteUrl(`${window.location.origin}/couple/join/${data.code}`);
      setInviteCode(data.code);
      setCopied(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "초대를 만들지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없으면 표시된 링크를 직접 복사하면 된다
    }
  }

  async function goDirect(e: React.FormEvent) {
    e.preventDefault();
    if (!me.date || !partner.date) {
      setError("두 사람의 생년월일을 모두 입력해주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/couples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: toPayload(me), b: toPayload(partner) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "궁합을 만들지 못했어요.");
      router.push(`/couple/result/${data.code}`);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "궁합을 만들지 못했어요.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={goDirect} className="grid gap-6">
      <div>
        <h2 className="mb-3 font-bold text-rose-deep">나의 정보</h2>
        <PersonFields value={me} onChange={setMe} />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={direct}
          onChange={(e) => {
            setDirect(e.target.checked);
            setInviteUrl(null);
            setInviteCode(null);
          }}
          className="h-4 w-4 accent-rose-deep"
        />
        애인의 생일도 알고 있어요 (초대 없이 바로 보기)
      </label>

      {direct && (
        <div>
          <h2 className="mb-3 font-bold text-rose-deep">애인의 정보</h2>
          <PersonFields value={partner} onChange={setPartner} />
        </div>
      )}

      {error && <p className="text-sm font-semibold text-sunset-deep">{error}</p>}

      {direct ? (
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-sunset via-rose-soft to-rose-deep px-6 py-4 text-lg font-extrabold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "AI가 궁합을 읽는 중… 🔮" : "우리 궁합 바로 보기 →"}
        </button>
      ) : (
        <button
          type="button"
          onClick={makeInvite}
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-sunset via-rose-soft to-rose-deep px-6 py-4 text-lg font-extrabold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "초대 만드는 중…" : "애인에게 보낼 초대 링크 만들기 💌"}
        </button>
      )}

      {inviteUrl && (
        <div className="grid gap-2 rounded-xl bg-cream p-4">
          <p className="text-sm font-semibold">이 링크를 애인에게 보내세요:</p>
          <p className="break-all font-mono text-xs text-rose-deep">{inviteUrl}</p>
          <button
            type="button"
            onClick={copyInvite}
            className="mt-1 rounded-xl border-2 border-rose-deep px-4 py-2.5 text-sm font-bold text-rose-deep transition hover:bg-rose-deep hover:text-white"
          >
            {copied ? "복사됐어요! 🎉" : "초대 링크 복사하기"}
          </button>
          <p className="text-xs leading-relaxed text-rose">
            애인이 생일을 입력하는 순간 AI가 둘의 궁합을 풀어요. 초대는 딱 한 번만 쓸 수
            있어요.
          </p>
          {inviteCode && (
            <WaitForCompletion
              code={inviteCode}
              message="이 페이지를 열어두세요 — 애인이 입력을 마치면 자동으로 결과로 이동해요"
            />
          )}
        </div>
      )}
    </form>
  );
}
