import { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog";
import { SERVICES } from "@/data/services";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/lineup", "/pricing", "/planner", "/blog", "/contact"].map(
    (path) => ({
      url: `${siteUrl}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const services = SERVICES.map((s) => ({
    url: `${siteUrl}/lineup/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const posts = BLOG_POSTS.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...services, ...posts];
}
