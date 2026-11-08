import { and, desc, eq, lt, or, sql } from "drizzle-orm";
import { getDb, devotionals } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, withExplicitCache } from "@/lib/cache";
import { requireAdminPermission } from "@/lib/auth";
import { decodeCompositeCursor, encodeCompositeCursor } from "@/lib/utils";
import type { CursorPaginationParams, PaginatedResult } from "@/types";

export interface DevotionalListItem {
  id: string;
  title: string;
  slug: string;
  scriptureReference: string;
  biblePassage: string;
  coverImage: string;
  authorName: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date;
  createdAt: Date;
}

const devotionalListingSelection = {
  id: devotionals.id,
  title: devotionals.title,
  slug: devotionals.slug,
  scriptureReference: devotionals.scriptureReference,
  biblePassage: devotionals.biblePassage,
  coverImage: devotionals.coverImage,
  authorName: devotionals.authorName,
  status: devotionals.status,
  publishedAt: devotionals.publishedAt,
  createdAt: devotionals.createdAt,
};

async function fetchLatestDevotionalsUncached(
  limit = 3
): Promise<DevotionalListItem[]> {
  const db = await getDb();
  return db
    .select(devotionalListingSelection)
    .from(devotionals)
    .where(eq(devotionals.status, "PUBLISHED"))
    .orderBy(desc(devotionals.publishedAt), desc(devotionals.id))
    .limit(limit);
}

export const getLatestPublishedDevotionals = withExplicitCache(
  fetchLatestDevotionalsUncached,
  ["public-latest-devotionals"],
  {
    tags: [CACHE_TAGS.DEVOTIONALS],
    revalidate: CACHE_TTL.PUBLISHED_CONTENT,
  }
);

export async function getPaginatedPublishedDevotionals(
  params: CursorPaginationParams = {}
): Promise<PaginatedResult<DevotionalListItem>> {
  const db = await getDb();
  const limit = Math.min(Math.max(params.limit ?? 6, 1), 30);
  const decoded = decodeCompositeCursor(params.cursor);

  const cursorCondition = decoded
    ? or(
        lt(devotionals.publishedAt, decoded.timestamp),
        and(
          eq(devotionals.publishedAt, decoded.timestamp),
          sql`${devotionals.id} < ${decoded.id}`
        )
      )
    : undefined;

  const whereClause = cursorCondition
    ? and(eq(devotionals.status, "PUBLISHED"), cursorCondition)
    : eq(devotionals.status, "PUBLISHED");

  const rows = await db
    .select(devotionalListingSelection)
    .from(devotionals)
    .where(whereClause)
    .orderBy(desc(devotionals.publishedAt), desc(devotionals.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const lastItem = items[items.length - 1];
  const nextCursor =
    hasMore && lastItem
      ? encodeCompositeCursor(lastItem.publishedAt, lastItem.id)
      : null;

  return { items, nextCursor, hasMore };
}

export async function getPublishedDevotionalBySlug(slug: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(devotionals)
    .where(and(eq(devotionals.slug, slug), eq(devotionals.status, "PUBLISHED")))
    .limit(1);

  return row ?? null;
}

export async function listAdminDevotionals(): Promise<DevotionalListItem[]> {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  return db
    .select(devotionalListingSelection)
    .from(devotionals)
    .orderBy(desc(devotionals.publishedAt), desc(devotionals.id));
}

export async function getAdminDevotionalById(id: string) {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  const [row] = await db
    .select()
    .from(devotionals)
    .where(eq(devotionals.id, id))
    .limit(1);

  return row ?? null;
}

