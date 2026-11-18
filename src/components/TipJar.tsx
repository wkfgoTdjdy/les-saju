import { tipUrl } from "@/lib/site";

/**
 * 복비함 — 결과 페이지 하단의 후원 링크. NEXT_PUBLIC_TIP_URL이 없으면 아무것도 그리지 않는다.
 * 결과 URL에는 생일이나 초대 코드가 들어 있으므로, 결제 사이트로 주소가 넘어가지 않게
 * referrer를 보내지 않는다.
 */
export default function TipJar() {
  if (!tipUrl) return null;
  return (
    <section className="card grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <h2 className="title text-xl">복비함</h2>
        <p className="mt-2 text-sm leading-relaxed text-sub">
          풀이가 마음에 들었다면 복비를 놓고 가세요. 내지 않아도 결과는 똑같이 볼 수 있어요
        </p>
      </div>
      <a
        href={tipUrl}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
        className="btn-secondary"
      >
        복비 내기
      </a>
    </section>
  );
}
