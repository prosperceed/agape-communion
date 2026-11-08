import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPaginatedPublishedPosts } from "@/features/blog/queries";
import { getPaginatedPublishedEvents } from "@/features/events/queries";
import { getPaginatedPublishedMessages } from "@/features/messages/queries";
import { getPaginatedPublishedDevotionals } from "@/features/devotionals/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/services",
    "/events",
    "/blog",
    "/messages",
    "/devotionals",
    "/testimonies",
    "/livestream",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const [postsPage, eventsPage, messagesPage, devotionalsPage] =
      await Promise.all([
        getPaginatedPublishedPosts({ limit: 30 }),
        getPaginatedPublishedEvents({ limit: 30 }),
        getPaginatedPublishedMessages({ limit: 30 }),
        getPaginatedPublishedDevotionals({ limit: 30 }),
      ]);

    const postRoutes: MetadataRoute.Sitemap = postsPage.items.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? p.createdAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const eventRoutes: MetadataRoute.Sitemap = eventsPage.items.map((e) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: e.publishedAt ?? e.startDate,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const messageRoutes: MetadataRoute.Sitemap = messagesPage.items.map((m) => ({
      url: `${baseUrl}/messages/${m.slug}`,
      lastModified: m.publishedAt ?? m.datePreached,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const devotionalRoutes: MetadataRoute.Sitemap = devotionalsPage.items.map(
      (d) => ({
        url: `${baseUrl}/devotionals/${d.slug}`,
        lastModified: d.publishedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    );

    return [
      ...staticRoutes,
      ...postRoutes,
      ...eventRoutes,
      ...messageRoutes,
      ...devotionalRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}

