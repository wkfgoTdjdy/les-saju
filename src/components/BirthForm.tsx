"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** 생일 입력 폼 — 결과는 쿼리 파라미터로만 전달한다 (서버 저장 없음). */
export default function BirthForm() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [nickname, setNickname] = useState("");
  const [calendar, setCalendar] = useState("solar");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      setError("생년월일을 입력해주세요.");
      return;
    }
    const params = new URLSearchParams({ d: date, cal: calendar });
    if (time) params.set("t", time);
    if (nickname.trim()) params.set("n", nickname.trim().slice(0, 20));
    router.push(`/result?${params.toString()}`);
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-rose-soft focus:ring-2 focus:ring-rose-soft/30";

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">
          닉네임 <span className="font-normal text-rose">(선택 — 결과에 표시될 이름)</span>
        </span>
        <input
          type="text"
          value={nickname}
          maxLength={20}
          placeholder="예: 조용한 장작불"
          onChange={(e) => setNickname(e.target.value)}
          className={inputCls}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">생년월일</span>
        <input
          type="date"
          value={date}
          min="1920-01-01"
          max="2012-12-31"
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">달력</span>
          <select
            value={calendar}
            onChange={(e) => setCalendar(e.target.value)}
            className={inputCls}
          >
            <option value="solar">양력</option>
            <option value="lunar">음력</option>
            <option value="lunar_leap">음력(윤달)</option>
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">
            태어난 시간 <span className="font-normal text-rose">(모르면 비워두세요)</span>
          </span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      {error && <p className="text-sm font-semibold text-sunset-deep">{error}</p>}

      <button
        type="submit"
        className="mt-2 rounded-xl bg-gradient-to-r from-sunset via-rose-soft to-rose-deep px-6 py-4 text-lg font-extrabold text-white transition hover:opacity-90"
      >
        내 레즈 사주 보기 →
      </button>
      <p className="text-center text-xs leading-relaxed text-rose">
        🔒 로그인 없이 바로 볼 수 있어요. 생년월일과 닉네임 외에는 어떤 정보도 받지 않고,
        <br className="hidden sm:block" />
        그마저도 서버에 저장하지 않아요 — 결과 링크에만 담겨요.
      </p>
    </form>
  );
}
