import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 결과·초대 페이지는 크롤링을 막지 않는다 — 막으면 검색엔진이 페이지의 noindex를
      // 읽지 못해, 외부에 링크가 걸렸을 때 URL(생일·초대 코드)만 색인될 수 있다.
      // 색인 제외는 각 페이지의 robots 메타(noindex)가 담당한다.
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
