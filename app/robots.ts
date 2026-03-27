import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://bodhiberry.com"; // Replace with actual domain

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/_next/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
