"use client";

export interface PersonInput {
  nickname: string;
  date: string;
  time: string;
  calendar: string;
}

export const EMPTY_PERSON: PersonInput = {
  nickname: "",
  date: "",
  time: "",
  calendar: "solar",
};

export const inputCls =
  "w-full rounded-xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-rose-soft focus:ring-2 focus:ring-rose-soft/30";

/** 한 사람 분량의 입력 필드 묶음 (닉네임/생년월일/달력/시간) — 커플 폼에서 재사용 */
export default function PersonFields({
  value,
  onChange,
}: {
  value: PersonInput;
  onChange: (next: PersonInput) => void;
}) {
  const set = (patch: Partial<PersonInput>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">
          닉네임 <span className="font-normal text-rose">(선택)</span>
        </span>
        <input
          type="text"
          value={value.nickname}
          maxLength={20}
          placeholder="예: 조용한 장작불"
          onChange={(e) => set({ nickname: e.target.value })}
          className={inputCls}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">생년월일</span>
        <input
          type="date"
          value={value.date}
          min="1920-01-01"
          max="2012-12-31"
          onChange={(e) => set({ date: e.target.value })}
          className={inputCls}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">달력</span>
          <select
            value={value.calendar}
            onChange={(e) => set({ calendar: e.target.value })}
            className={inputCls}
          >
            <option value="solar">양력</option>
            <option value="lunar">음력</option>
            <option value="lunar_leap">음력(윤달)</option>
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">
            태어난 시간 <span className="font-normal text-rose">(선택)</span>
          </span>
          <input
            type="time"
            value={value.time}
            onChange={(e) => set({ time: e.target.value })}
            className={inputCls}
          />
        </label>
      </div>
    </div>
  );
}

/** PersonInput → 쿼리 파라미터. prefix: "a" | "b" */
export function personToParams(p: PersonInput, prefix: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set(`${prefix}d`, p.date);
  params.set(`${prefix}cal`, p.calendar);
  if (p.time) params.set(`${prefix}t`, p.time);
  if (p.nickname.trim()) params.set(`${prefix}n`, p.nickname.trim().slice(0, 20));
  return params;
}
