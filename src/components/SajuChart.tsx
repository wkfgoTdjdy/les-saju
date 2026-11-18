import type { SajuResult, Pillar } from "@/lib/saju";
import { tenGodOf } from "@/lib/les";

/**
 * 사주 명식표 — 네 기둥 여덟 글자를 한자로 조판한다.
 * 전통 순서대로 왼쪽부터 시·일·월·연. 일간(나를 뜻하는 글자)만 강조색.
 * showTenGods: 글자마다 일간 기준 십신(비겁·식상·재성·관성·인성)을 함께 적는다 —
 * 결과 페이지의 모든 해석이 이 분포에서 나오므로 "왜"의 출발점이 된다.
 */
export default function SajuChart({
  saju,
  caption,
  showTenGods = false,
}: {
  saju: SajuResult;
  caption?: string;
  showTenGods?: boolean;
}) {
  const dm = saju.dayMaster.element;
  const { time, day, month, year } = saju.pillars;
  const cols: [string, Pillar | null][] = [
    ["시주", time],
    ["일주", day],
    ["월주", month],
    ["연주", year],
  ];

  return (
    <figure>
      <div className="grid grid-cols-4 overflow-hidden rounded-xl border border-line bg-card text-center">
        {cols.map(([name, p], i) => (
          <div key={name} className={i > 0 ? "border-l border-line" : undefined}>
            <p className="label border-b border-line py-2">{name}</p>
            {[0, 1].map((row) => (
              <div
                key={row}
                className={`py-3 ${row === 1 ? "border-t border-line" : ""}`}
              >
                <p
                  className={`font-serif text-[40px] leading-none font-medium ${
                    name === "일주" && row === 0 ? "text-accent" : "text-ink"
                  } ${p ? "" : "text-muted"}`}
                >
                  {p ? p.hanja[row] : "—"}
                </p>
                <p className="label mt-2">
                  {p
                    ? row === 0
                      ? `${p.stem} · ${p.stemElement}`
                      : `${p.branch} · ${p.branchElement}`
                    : "미상"}
                </p>
                {showTenGods && (
                  <p className="text-[13px] leading-5 font-medium">
                    {!p
                      ? "\u00a0"
                      : name === "일주" && row === 0
                        ? "나"
                        : tenGodOf(dm, row === 0 ? p.stemElement : p.branchElement)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {caption && <figcaption className="label mt-2">{caption}</figcaption>}
    </figure>
  );
}
