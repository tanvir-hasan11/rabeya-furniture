import type { MetadataRoute } from "next";
import { getCategories, getProducts, getBlogPosts } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    getProducts(),
    getCategories(),
    getBlogPosts(),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/faq",
    "/contact",
    "/blog",
    "/track-order",
    "/delivery-policy",
    "/return-refund",
    "/privacy-policy",
  ].map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.5 }));

  return [
    ...staticRoutes,
    ...categories.map((c) => ({
      url: `${BASE}/shop?category=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${BASE}/p/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((b) => ({
      url: `${BASE}/blog/${b.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
