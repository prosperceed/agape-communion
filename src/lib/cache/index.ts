import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export const CACHE_TAGS = {
  SETTINGS: "church-settings",
  SERVICES: "church-services",
  EVENTS: "church-events",
  POSTS: "church-posts",
  MESSAGES: "church-messages",
  DEVOTIONALS: "church-devotionals",
  TESTIMONIES: "church-testimonies",
  LIVESTREAMS: "church-livestreams",
  MEDIA: "church-media",
  CATEGORIES: "church-categories",
} as const;

export const CACHE_TTL = {
  CHURCH_SETTINGS: 3600 * 12, // 12 hours (long-lived)
  STATIC_CONTENT: 3600 * 6, // 6 hours
  PUBLISHED_CONTENT: 1800, // 30 minutes
  EVENTS: 900, // 15 minutes
  LIVESTREAM_STATUS: 30, // 30 seconds (short-lived)
} as const;

const invalidatedTagHistory: string[] = [];

export function getInvalidatedTagHistory(): string[] {
  return [...invalidatedTagHistory];
}

export function clearInvalidatedTagHistory(): void {
  invalidatedTagHistory.length = 0;
}

export function withExplicitCache<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyParts: string[],
  options: { tags: string[]; revalidate: number }
): (...args: TArgs) => Promise<TResult> {
  if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") {
    return fn;
  }

  return (...args: TArgs) => {
    try {
      const cached = unstable_cache(fn, keyParts, {
        tags: options.tags,
        revalidate: options.revalidate,
      });
      return cached(...args);
    } catch {
      return fn(...args);
    }
  };
}

export function invalidateContentCache(tags: string[], paths: string[] = []): void {
  for (const tag of tags) {
    invalidatedTagHistory.push(tag);
    try {
      revalidateTag(tag, "max");
    } catch {
      // Outside Next.js request context (e.g., unit tests or CLI scripts)
    }
  }

  for (const routePath of paths) {
    try {
      revalidatePath(routePath);
    } catch {
      // Outside Next.js request context
    }
  }
}
