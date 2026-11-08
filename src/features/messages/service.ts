import { and, eq, ne } from "drizzle-orm";
import { getDb, messages } from "@/lib/db";
import { logAdminActivity, requireAdminPermission } from "@/lib/auth";
import { CACHE_TAGS, invalidateContentCache } from "@/lib/cache";
import { generateUniqueSlug } from "@/lib/utils";
import { messageInputSchema, type MessageInput } from "./schemas";

export async function createMessageEntry(rawInput: MessageInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = messageInputSchema.parse(rawInput);
  const db = await getDb();

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: messages.id })
        .from(messages)
        .where(eq(messages.slug, candidate))
        .limit(1);
      return Boolean(found);
    }
  );

  const [created] = await db
    .insert(messages)
    .values({
      title: parsed.title,
      slug,
      speaker: parsed.speaker,
      seriesName: parsed.seriesName || null,
      description: parsed.description,
      scriptureReferences: parsed.scriptureReferences,
      datePreached: new Date(parsed.datePreached),
      thumbnailUrl: parsed.thumbnailUrl,
      videoUrl: parsed.videoUrl || null,
      audioUrl: parsed.audioUrl || null,
      categoryId: parsed.categoryId || null,
      status: parsed.status,
      authorId: actor.id,
      publishedAt: parsed.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();

  await logAdminActivity({
    actor,
    action: "CREATE_MESSAGE",
    entityType: "MESSAGE",
    entityId: created.id,
    summary: `Created sermon message "${created.title}" by ${created.speaker}.`,
  });

  invalidateContentCache(
    [CACHE_TAGS.MESSAGES],
    ["/", "/messages", `/messages/${created.slug}`, "/admin/messages"]
  );

  return created;
}

export async function updateMessageEntry(id: string, rawInput: MessageInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = messageInputSchema.parse(rawInput);
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Message not found.");
  }

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: messages.id })
        .from(messages)
        .where(and(eq(messages.slug, candidate), ne(messages.id, id)))
        .limit(1);
      return Boolean(found);
    }
  );

  const [updated] = await db
    .update(messages)
    .set({
      title: parsed.title,
      slug,
      speaker: parsed.speaker,
      seriesName: parsed.seriesName || null,
      description: parsed.description,
      scriptureReferences: parsed.scriptureReferences,
      datePreached: new Date(parsed.datePreached),
      thumbnailUrl: parsed.thumbnailUrl,
      videoUrl: parsed.videoUrl || null,
      audioUrl: parsed.audioUrl || null,
      categoryId: parsed.categoryId || null,
      status: parsed.status,
      publishedAt:
        parsed.status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, id))
    .returning();

  await logAdminActivity({
    actor,
    action: "UPDATE_MESSAGE",
    entityType: "MESSAGE",
    entityId: updated.id,
    summary: `Updated sermon message "${updated.title}" (${updated.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.MESSAGES],
    ["/", "/messages", `/messages/${updated.slug}`, "/admin/messages"]
  );

  return updated;
}

export async function updateMessageStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [updated] = await db
    .update(messages)
    .set({
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, id))
    .returning();

  if (!updated) {
    throw new Error("Message not found.");
  }

  await logAdminActivity({
    actor,
    action: `MESSAGE_STATUS_${status}`,
    entityType: "MESSAGE",
    entityId: updated.id,
    summary: `Changed message "${updated.title}" status to ${status}.`,
  });

  invalidateContentCache(
    [CACHE_TAGS.MESSAGES],
    ["/", "/messages", `/messages/${updated.slug}`, "/admin/messages"]
  );

  return updated;
}

export async function deleteMessageEntry(id: string) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [deleted] = await db
    .delete(messages)
    .where(eq(messages.id, id))
    .returning();

  if (!deleted) {
    throw new Error("Message not found.");
  }

  await logAdminActivity({
    actor,
    action: "DELETE_MESSAGE",
    entityType: "MESSAGE",
    entityId: deleted.id,
    summary: `Deleted sermon message "${deleted.title}".`,
  });

  invalidateContentCache(
    [CACHE_TAGS.MESSAGES],
    ["/", "/messages", "/admin/messages"]
  );

  return deleted;
}

