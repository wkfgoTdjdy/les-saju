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

  const inputCls = "field";

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium">
          닉네임 <span className="font-normal text-muted">(선택)</span>
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

      <label className="grid gap-2">
        <span className="text-sm font-medium">생년월일</span>
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
        <label className="grid gap-2">
          <span className="text-sm font-medium">달력</span>
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
        <label className="grid gap-2">
          <span className="text-sm font-medium">
            태어난 시간 <span className="font-normal text-muted">(선택)</span>
          </span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      {error && <p className="text-sm text-seal">{error}</p>}

      <button type="submit" className="btn-primary mt-2">
        내 레즈 사주 보기
      </button>
      <p className="label">
        로그인 없이 바로 볼 수 있어요. 생년월일과 닉네임은 서버에 저장하지 않고 결과 링크에만
        담겨요.
      </p>
    </form>
  );
}
