import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kazperkreative.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectSlugs: { slug: string }[] = await client.fetch(
    `*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`
  );

  const projectUrls = projectSlugs.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/agents/join`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/brief`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/discovery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...projectUrls,
  ];
}
