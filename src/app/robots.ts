import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 생일·초대 코드가 URL에 노출되는 페이지는 사실상 비공개 공간이므로 색인 제외
      disallow: ["/result", "/couple/join/", "/couple/result/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
