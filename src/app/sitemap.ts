import { MetadataRoute } from "next";
import { PROJECT_ORDER } from "@/data/projects";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kazperkreative.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; freq: "weekly" | "monthly" }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/agency", priority: 0.9, freq: "monthly" },
    { path: "/studio", priority: 0.9, freq: "weekly" },
    { path: "/work", priority: 0.8, freq: "weekly" },
    { path: "/join", priority: 0.7, freq: "monthly" },
    { path: "/contact", priority: 0.8, freq: "monthly" },
  ];

  const projectUrls = PROJECT_ORDER.map((slug) => ({
    url: `${siteUrl}/work/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /portfolio and /inbox are intentionally excluded (noindex).
  return [
    ...staticRoutes.map((r) => ({
      url: `${siteUrl}${r.path}`,
      lastModified: now,
      changeFrequency: r.freq,
      priority: r.priority,
    })),
    ...projectUrls,
  ];
}
