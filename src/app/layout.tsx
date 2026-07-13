import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { siteUrl, gaId } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LES SAJU — 레즈비언 전용 사주",
    template: "%s | LES SAJU",
  },
  description:
    "사주에 새겨진 나의 레즈 기질. 생년월일만 입력하면 팸-부치 스펙트럼, 남성운 정산, 애인 찾을 스팟 추천까지. 로그인 없음, 저장 없음.",
  keywords: [
    "레즈비언 사주",
    "레즈 사주",
    "레즈비언 커플 궁합",
    "여자 커플 궁합",
    "동성 커플 궁합",
    "팸 부치 테스트",
    "퀴어 사주",
    "레즈비언 테스트",
    "사주 궁합",
    "무료 사주",
    "커플 궁합 테스트",
    "동거지수",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "LES SAJU",
    title: "LES SAJU — 레즈비언 전용 사주",
    description:
      "사주에 새겨진 나의 레즈 기질. 팸-부치 스펙트럼부터 동거지수까지, 생년월일 하나로.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LES SAJU — 레즈비언 전용 사주",
    description:
      "사주에 새겨진 나의 레즈 기질. 팸-부치 스펙트럼부터 커플 궁합까지, 생년월일 하나로.",
  },
  robots: { index: true, follow: true },
  verification: {
    // 서치콘솔(URL 접두어 속성) HTML 태그 검증값 — 배포 환경변수로 주입
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        {/* Google Analytics 4 (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
        </Script>
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 sm:px-6">
          <header className="flex items-center justify-between border-b border-line py-6">
            <Link href="/" className="text-xl font-extrabold tracking-tight">
              🌈 LES SAJU
            </Link>
            <span className="hidden font-mono text-xs uppercase tracking-widest text-rose sm:inline">
              Lesbian × Saju
            </span>
          </header>
          <main className="flex-1 pb-16 pt-8">{children}</main>
          <footer className="grid gap-1 border-t border-line py-6 text-center text-xs text-rose">
            <p>재미로 보는 사주입니다 — 당신의 정체성은 만세력보다 당신이 더 잘 압니다 🏳️‍🌈</p>
            <p>
              🔒 로그인 필요 없음 · 생년월일과 닉네임 외에는 어떤 정보도 저장하지 않아요
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
