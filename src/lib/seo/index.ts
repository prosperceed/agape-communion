import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export function buildPageMetadata(params: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
}): Metadata {
  const description = params.description || siteConfig.description;
  const canonicalUrl = `${siteConfig.url}${params.path || ""}`;
  const ogImage = params.image
    ? params.image.startsWith("http")
      ? params.image
      : `${siteConfig.url}${params.image}`
    : `${siteConfig.url}/assets/hero/worship-sanctuary.jpg`;

  return {
    title: `${params.title} | ${siteConfig.name}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: params.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: `${params.title} | ${siteConfig.name}`,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      type: params.type || "website",
      publishedTime: params.publishedTime,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: params.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${params.title} | ${siteConfig.name}`,
      description,
      images: [ogImage],
    },
  };
}

export function buildChurchJsonLd(params?: {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    name: params?.name || siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: params?.phone || siteConfig.defaultPhone,
    email: params?.email || siteConfig.defaultEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: params?.address || siteConfig.defaultAddress,
      addressLocality: "Lekki, Lagos",
      addressRegion: "Lagos State",
      addressCountry: "NG",
    },
  };
}

export function buildEventJsonLd(event: {
  title: string;
  slug: string;
  excerpt: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  venue: string;
  coverImage: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.excerpt,
    startDate:
      typeof event.startDate === "string"
        ? event.startDate
        : event.startDate.toISOString(),
    endDate: event.endDate
      ? typeof event.endDate === "string"
        ? event.endDate
        : event.endDate.toISOString()
      : undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.venue,
      address: event.venue,
    },
    image: [`${siteConfig.url}${event.coverImage}`],
    organizer: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function buildArticleJsonLd(post: {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [`${siteConfig.url}${post.coverImage}`],
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.logo}`,
      },
    },
    datePublished: post.publishedAt
      ? typeof post.publishedAt === "string"
        ? post.publishedAt
        : post.publishedAt.toISOString()
      : undefined,
    dateModified: post.updatedAt
      ? typeof post.updatedAt === "string"
        ? post.updatedAt
        : post.updatedAt.toISOString()
      : undefined,
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };
}

export function buildVideoJsonLd(video: {
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: Date | string;
  embedUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [
      video.thumbnailUrl.startsWith("http")
        ? video.thumbnailUrl
        : `${siteConfig.url}${video.thumbnailUrl}`,
    ],
    uploadDate:
      typeof video.uploadDate === "string"
        ? video.uploadDate
        : video.uploadDate.toISOString(),
    embedUrl: video.embedUrl || undefined,
  };
}
