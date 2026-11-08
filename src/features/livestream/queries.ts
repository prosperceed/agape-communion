import { asc, desc, eq } from "drizzle-orm";
import { getDb, livestreams } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, withExplicitCache } from "@/lib/cache";
import { requireAdminPermission } from "@/lib/auth";

export type LivestreamRecord = typeof livestreams.$inferSelect;

async function fetchPublicLivestreamOverviewUncached() {
  const db = await getDb();

  const [activeRows, scheduledRows, pastRows] = await Promise.all([
    db
      .select()
      .from(livestreams)
      .where(eq(livestreams.status, "LIVE"))
      .orderBy(desc(livestreams.startedAt), desc(livestreams.scheduledFor))
      .limit(1),
    db
      .select()
      .from(livestreams)
      .where(eq(livestreams.status, "SCHEDULED"))
      .orderBy(asc(livestreams.scheduledFor))
      .limit(4),
    db
      .select()
      .from(livestreams)
      .where(eq(livestreams.status, "ENDED"))
      .orderBy(desc(livestreams.endedAt), desc(livestreams.scheduledFor))
      .limit(6),
  ]);

  return {
    activeStream: activeRows[0] ?? null,
    scheduledStreams: scheduledRows,
    previousStreams: pastRows,
  };
}

export const getPublicLivestreamOverview = withExplicitCache(
  fetchPublicLivestreamOverviewUncached,
  ["public-livestream-overview"],
  {
    tags: [CACHE_TAGS.LIVESTREAMS],
    revalidate: CACHE_TTL.LIVESTREAM_STATUS,
  }
);

export async function listAdminLivestreams(): Promise<LivestreamRecord[]> {
  await requireAdminPermission("MANAGE_LIVESTREAMS");
  const db = await getDb();
  return db
    .select()
    .from(livestreams)
    .orderBy(desc(livestreams.scheduledFor), desc(livestreams.createdAt));
}

export async function getAdminLivestreamById(
  id: string
): Promise<LivestreamRecord | null> {
  await requireAdminPermission("MANAGE_LIVESTREAMS");
  const db = await getDb();
  const [row] = await db
    .select()
    .from(livestreams)
    .where(eq(livestreams.id, id))
    .limit(1);

  return row ?? null;
}

