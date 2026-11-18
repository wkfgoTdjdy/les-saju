/** 인주색 낙관 도장 — 일간 한자를 새긴다. 유형 이름 옆에만 쓰는 시그니처. */
export default function Seal({
  hanja,
  size = 44,
}: {
  hanja: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 -rotate-3 items-center justify-center rounded-md bg-seal font-serif font-semibold leading-none text-white"
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      {hanja}
    </span>
  );
}
