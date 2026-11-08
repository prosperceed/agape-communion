import { and, desc, eq, lt, or, sql } from "drizzle-orm";
import { getDb, messages, categories } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, withExplicitCache } from "@/lib/cache";
import { requireAdminPermission } from "@/lib/auth";
import { decodeCompositeCursor, encodeCompositeCursor } from "@/lib/utils";
import type { CursorPaginationParams, PaginatedResult } from "@/types";

export interface MessageListItem {
  id: string;
  title: string;
  slug: string;
  speaker: string;
  seriesName: string | null;
  description: string;
  scriptureReferences: string;
  datePreached: Date;
  thumbnailUrl: string;
  videoUrl: string | null;
  audioUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date | null;
}

const messageSelection = {
  id: messages.id,
  title: messages.title,
  slug: messages.slug,
  speaker: messages.speaker,
  seriesName: messages.seriesName,
  description: messages.description,
  scriptureReferences: messages.scriptureReferences,
  datePreached: messages.datePreached,
  thumbnailUrl: messages.thumbnailUrl,
  videoUrl: messages.videoUrl,
  audioUrl: messages.audioUrl,
  categoryId: messages.categoryId,
  categoryName: categories.name,
  status: messages.status,
  publishedAt: messages.publishedAt,
};

async function fetchRecentMessagesUncached(
  limit = 3
): Promise<MessageListItem[]> {
  const db = await getDb();
  return db
    .select(messageSelection)
    .from(messages)
    .leftJoin(categories, eq(messages.categoryId, categories.id))
    .where(eq(messages.status, "PUBLISHED"))
    .orderBy(desc(messages.datePreached), desc(messages.id))
    .limit(limit);
}

export const getRecentPublishedMessages = withExplicitCache(
  fetchRecentMessagesUncached,
  ["public-recent-messages"],
  {
    tags: [CACHE_TAGS.MESSAGES],
    revalidate: CACHE_TTL.PUBLISHED_CONTENT,
  }
);

export async function getPaginatedPublishedMessages(
  params: CursorPaginationParams & { speaker?: string; series?: string } = {}
): Promise<PaginatedResult<MessageListItem>> {
  const db = await getDb();
  const limit = Math.min(Math.max(params.limit ?? 6, 1), 30);
  const decoded = decodeCompositeCursor(params.cursor);

  const conditions = [eq(messages.status, "PUBLISHED")];

  if (params.speaker) {
    conditions.push(eq(messages.speaker, params.speaker));
  }
  if (params.series) {
    conditions.push(eq(messages.seriesName, params.series));
  }

  if (decoded) {
    conditions.push(
      or(
        lt(messages.datePreached, decoded.timestamp),
        and(
          eq(messages.datePreached, decoded.timestamp),
          sql`${messages.id} < ${decoded.id}`
        )
      )!
    );
  }

  const rows = await db
    .select(messageSelection)
    .from(messages)
    .leftJoin(categories, eq(messages.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(messages.datePreached), desc(messages.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const lastItem = items[items.length - 1];
  const nextCursor =
    hasMore && lastItem
      ? encodeCompositeCursor(lastItem.datePreached, lastItem.id)
      : null;

  return { items, nextCursor, hasMore };
}

export async function getPublishedMessageBySlug(slug: string) {
  const db = await getDb();
  const [row] = await db
    .select(messageSelection)
    .from(messages)
    .leftJoin(categories, eq(messages.categoryId, categories.id))
    .where(and(eq(messages.slug, slug), eq(messages.status, "PUBLISHED")))
    .limit(1);

  return row ?? null;
}

export async function listAdminMessages(): Promise<MessageListItem[]> {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  return db
    .select(messageSelection)
    .from(messages)
    .leftJoin(categories, eq(messages.categoryId, categories.id))
    .orderBy(desc(messages.datePreached), desc(messages.id));
}

export async function getAdminMessageById(id: string) {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  const [row] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);

  return row ?? null;
}

