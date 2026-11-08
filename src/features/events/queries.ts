import { and, asc, desc, eq, gte, lt, or, sql } from "drizzle-orm";
import { getDb, events } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, withExplicitCache } from "@/lib/cache";
import { requireAdminPermission } from "@/lib/auth";
import { decodeCompositeCursor, encodeCompositeCursor } from "@/lib/utils";
import type { CursorPaginationParams, PaginatedResult } from "@/types";

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  startDate: Date;
  endDate: Date | null;
  venue: string;
  registrationUrl: string | null;
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date | null;
}

const eventListingSelection = {
  id: events.id,
  title: events.title,
  slug: events.slug,
  excerpt: events.excerpt,
  coverImage: events.coverImage,
  startDate: events.startDate,
  endDate: events.endDate,
  venue: events.venue,
  registrationUrl: events.registrationUrl,
  isFeatured: events.isFeatured,
  status: events.status,
  publishedAt: events.publishedAt,
};

async function fetchUpcomingEventsUncached(limit = 6): Promise<EventListItem[]> {
  const db = await getDb();
  const now = new Date();
  return db
    .select(eventListingSelection)
    .from(events)
    .where(and(eq(events.status, "PUBLISHED"), gte(events.startDate, now)))
    .orderBy(asc(events.startDate), asc(events.id))
    .limit(limit);
}

export const getUpcomingPublishedEvents = withExplicitCache(
  fetchUpcomingEventsUncached,
  ["public-upcoming-events"],
  {
    tags: [CACHE_TAGS.EVENTS],
    revalidate: CACHE_TTL.EVENTS,
  }
);

async function fetchPastEventsUncached(limit = 6): Promise<EventListItem[]> {
  const db = await getDb();
  const now = new Date();
  return db
    .select(eventListingSelection)
    .from(events)
    .where(and(eq(events.status, "PUBLISHED"), lt(events.startDate, now)))
    .orderBy(desc(events.startDate), desc(events.id))
    .limit(limit);
}

export const getPastPublishedEvents = withExplicitCache(
  fetchPastEventsUncached,
  ["public-past-events"],
  {
    tags: [CACHE_TAGS.EVENTS],
    revalidate: CACHE_TTL.EVENTS,
  }
);

export async function getPaginatedPublishedEvents(
  params: CursorPaginationParams = {}
): Promise<PaginatedResult<EventListItem>> {
  const db = await getDb();
  const limit = Math.min(Math.max(params.limit ?? 6, 1), 30);
  const decoded = decodeCompositeCursor(params.cursor);

  const cursorCondition = decoded
    ? or(
        lt(events.startDate, decoded.timestamp),
        and(
          eq(events.startDate, decoded.timestamp),
          sql`${events.id} < ${decoded.id}`
        )
      )
    : undefined;

  const whereClause = cursorCondition
    ? and(eq(events.status, "PUBLISHED"), cursorCondition)
    : eq(events.status, "PUBLISHED");

  const rows = await db
    .select(eventListingSelection)
    .from(events)
    .where(whereClause)
    .orderBy(desc(events.startDate), desc(events.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const lastItem = items[items.length - 1];
  const nextCursor =
    hasMore && lastItem
      ? encodeCompositeCursor(lastItem.startDate, lastItem.id)
      : null;

  return { items, nextCursor, hasMore };
}

export async function getPublishedEventBySlug(slug: string) {
  const db = await getDb();
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.status, "PUBLISHED")))
    .limit(1);

  return event ?? null;
}

export async function listAdminEvents() {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  return db
    .select(eventListingSelection)
    .from(events)
    .orderBy(desc(events.startDate), desc(events.createdAt));
}

export async function getAdminEventById(id: string) {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  return event ?? null;
}

