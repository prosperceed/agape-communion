import { and, eq, ne } from "drizzle-orm";
import { getDb, livestreams } from "@/lib/db";
import { logAdminActivity, requireAdminPermission } from "@/lib/auth";
import { CACHE_TAGS, invalidateContentCache } from "@/lib/cache";
import {
  generateUniqueSlug,
  validateAndBuildLivestreamEmbed,
} from "@/lib/utils";
import { livestreamInputSchema, type LivestreamInput } from "./schemas";
import type { LivestreamStatus } from "@/types";

export async function createLivestreamAnnouncement(rawInput: LivestreamInput) {
  const actor = await requireAdminPermission("MANAGE_LIVESTREAMS");
  const parsed = livestreamInputSchema.parse(rawInput);
  const embedValidation = validateAndBuildLivestreamEmbed(
    parsed.platform,
    parsed.streamUrl
  );

  if (!embedValidation.isValid) {
    throw new Error(embedValidation.error || "Invalid livestream URL.");
  }

  const db = await getDb();
  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: livestreams.id })
        .from(livestreams)
        .where(eq(livestreams.slug, candidate))
        .limit(1);
      return Boolean(found);
    }
  );

  const created = await db.transaction(async (tx) => {
    if (parsed.status === "LIVE") {
      await tx
        .update(livestreams)
        .set({ status: "ENDED", endedAt: new Date(), updatedAt: new Date() })
        .where(eq(livestreams.status, "LIVE"));
    }

    const [inserted] = await tx
      .insert(livestreams)
      .values({
        title: parsed.title,
        slug,
        description: parsed.description,
        platform: parsed.platform,
        streamUrl: parsed.streamUrl,
        embedUrl: embedValidation.embedUrl,
        thumbnailUrl: parsed.thumbnailUrl,
        status: parsed.status,
        scheduledFor: new Date(parsed.scheduledFor),
        startedAt: parsed.status === "LIVE" ? new Date() : null,
        endedAt: parsed.status === "ENDED" ? new Date() : null,
        updatedById: actor.id,
      })
      .returning();

    return inserted;
  });

  await logAdminActivity({
    actor,
    action: "CREATE_LIVESTREAM",
    entityType: "LIVESTREAM",
    entityId: created.id,
    summary: `Created livestream "${created.title}" (${created.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.LIVESTREAMS],
    ["/", "/livestream", "/admin/livestream"]
  );

  return created;
}

export async function updateLivestreamAnnouncement(
  id: string,
  rawInput: LivestreamInput
) {
  const actor = await requireAdminPermission("MANAGE_LIVESTREAMS");
  const parsed = livestreamInputSchema.parse(rawInput);
  const embedValidation = validateAndBuildLivestreamEmbed(
    parsed.platform,
    parsed.streamUrl
  );

  if (!embedValidation.isValid) {
    throw new Error(embedValidation.error || "Invalid livestream URL.");
  }

  const db = await getDb();
  const [existing] = await db
    .select()
    .from(livestreams)
    .where(eq(livestreams.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Livestream not found.");
  }

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: livestreams.id })
        .from(livestreams)
        .where(and(eq(livestreams.slug, candidate), ne(livestreams.id, id)))
        .limit(1);
      return Boolean(found);
    }
  );

  const updated = await db.transaction(async (tx) => {
    if (parsed.status === "LIVE") {
      await tx
        .update(livestreams)
        .set({ status: "ENDED", endedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(livestreams.status, "LIVE"), ne(livestreams.id, id)));
    }

    const [row] = await tx
      .update(livestreams)
      .set({
        title: parsed.title,
        slug,
        description: parsed.description,
        platform: parsed.platform,
        streamUrl: parsed.streamUrl,
        embedUrl: embedValidation.embedUrl,
        thumbnailUrl: parsed.thumbnailUrl,
        status: parsed.status,
        scheduledFor: new Date(parsed.scheduledFor),
        startedAt:
          parsed.status === "LIVE"
            ? existing.startedAt ?? new Date()
            : existing.startedAt,
        endedAt:
          parsed.status === "ENDED"
            ? existing.endedAt ?? new Date()
            : existing.endedAt,
        updatedById: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(livestreams.id, id))
      .returning();

    return row;
  });

  await logAdminActivity({
    actor,
    action: "UPDATE_LIVESTREAM",
    entityType: "LIVESTREAM",
    entityId: updated.id,
    summary: `Updated livestream "${updated.title}" (${updated.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.LIVESTREAMS],
    ["/", "/livestream", "/admin/livestream"]
  );

  return updated;
}

export async function changeLivestreamState(
  id: string,
  nextStatus: LivestreamStatus
) {
  const actor = await requireAdminPermission("MANAGE_LIVESTREAMS");
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(livestreams)
    .where(eq(livestreams.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Livestream not found.");
  }

  const updated = await db.transaction(async (tx) => {
    if (nextStatus === "LIVE") {
      await tx
        .update(livestreams)
        .set({ status: "ENDED", endedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(livestreams.status, "LIVE"), ne(livestreams.id, id)));
    }

    const [row] = await tx
      .update(livestreams)
      .set({
        status: nextStatus,
        startedAt:
          nextStatus === "LIVE"
            ? existing.startedAt ?? new Date()
            : existing.startedAt,
        endedAt: nextStatus === "ENDED" ? new Date() : existing.endedAt,
        updatedById: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(livestreams.id, id))
      .returning();

    return row;
  });

  await logAdminActivity({
    actor,
    action: `LIVESTREAM_STATE_${nextStatus}`,
    entityType: "LIVESTREAM",
    entityId: updated.id,
    summary: `Changed livestream "${updated.title}" state to ${nextStatus}.`,
  });

  invalidateContentCache(
    [CACHE_TAGS.LIVESTREAMS],
    ["/", "/livestream", "/admin/livestream"]
  );

  return updated;
}

export async function deleteLivestreamAnnouncement(id: string) {
  const actor = await requireAdminPermission("MANAGE_LIVESTREAMS");
  const db = await getDb();

  const [deleted] = await db
    .delete(livestreams)
    .where(eq(livestreams.id, id))
    .returning();

  if (!deleted) {
    throw new Error("Livestream not found.");
  }

  await logAdminActivity({
    actor,
    action: "DELETE_LIVESTREAM",
    entityType: "LIVESTREAM",
    entityId: deleted.id,
    summary: `Deleted livestream "${deleted.title}".`,
  });

  invalidateContentCache(
    [CACHE_TAGS.LIVESTREAMS],
    ["/", "/livestream", "/admin/livestream"]
  );

  return deleted;
}

