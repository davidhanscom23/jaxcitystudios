import { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog";
import { SERVICES } from "@/data/services";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/lineup",
    "/company-show",
    "/pricing",
    "/planner",
    "/blog",
    "/contact",
    "/app",
    "/agreement",
  ].map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority:
      path === ""
        ? 1
        : path === "/company-show" || path === "/app"
          ? 0.9
          : 0.8,
  }));

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
