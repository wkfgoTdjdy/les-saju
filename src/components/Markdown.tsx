"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** AI 리포트 마크다운 렌더러 — GFM(표 등) 지원. 요소별 스타일은 globals.css의 .report-md에 정의 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="report-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
