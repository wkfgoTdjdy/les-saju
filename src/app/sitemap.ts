import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { DAY_MASTERS } from "@/lib/les";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/couple`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...DAY_MASTERS.map((d) => ({
      url: `${siteUrl}/types/${d.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
