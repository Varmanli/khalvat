import type { MetadataRoute } from "next";

const siteUrl = process.env.APP_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/entries",
          "/tasks",
          "/task-categories",
          "/gratitude",
          "/habits",
          "/reminders",
          "/settings",
          "/search",
          "/admin",
          "/api",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
