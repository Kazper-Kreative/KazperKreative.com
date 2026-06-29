import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://kazperkreative.com";

// Allow the public marketing site; keep the gated/private/app surfaces out of
// crawlers (they're also noindex'd at the page + header level). Points crawlers
// at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/lab", "/lab-assets", "/inbox", "/portal", "/admin", "/api/"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
