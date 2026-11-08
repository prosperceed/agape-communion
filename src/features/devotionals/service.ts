import { and, eq, ne } from "drizzle-orm";
import { getDb, devotionals } from "@/lib/db";
import { logAdminActivity, requireAdminPermission } from "@/lib/auth";
import { CACHE_TAGS, invalidateContentCache } from "@/lib/cache";
import { generateUniqueSlug } from "@/lib/utils";
import { devotionalInputSchema, type DevotionalInput } from "./schemas";

export async function createDevotionalEntry(rawInput: DevotionalInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = devotionalInputSchema.parse(rawInput);
  const db = await getDb();

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: devotionals.id })
        .from(devotionals)
        .where(eq(devotionals.slug, candidate))
        .limit(1);
      return Boolean(found);
    }
  );

  const [created] = await db
    .insert(devotionals)
    .values({
      title: parsed.title,
      slug,
      scriptureReference: parsed.scriptureReference,
      biblePassage: parsed.biblePassage,
      content: parsed.content,
      reflectionPrompt: parsed.reflectionPrompt,
      coverImage: parsed.coverImage,
      authorName: parsed.authorName,
      status: parsed.status,
      authorId: actor.id,
      publishedAt: new Date(parsed.publishedAt),
    })
    .returning();

  await logAdminActivity({
    actor,
    action: "CREATE_DEVOTIONAL",
    entityType: "DEVOTIONAL",
    entityId: created.id,
    summary: `Created devotional "${created.title}" (${created.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.DEVOTIONALS],
    ["/", "/devotionals", `/devotionals/${created.slug}`, "/admin/devotionals"]
  );

  return created;
}

export async function updateDevotionalEntry(
  id: string,
  rawInput: DevotionalInput
) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = devotionalInputSchema.parse(rawInput);
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(devotionals)
    .where(eq(devotionals.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Devotional not found.");
  }

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: devotionals.id })
        .from(devotionals)
        .where(and(eq(devotionals.slug, candidate), ne(devotionals.id, id)))
        .limit(1);
      return Boolean(found);
    }
  );

  const [updated] = await db
    .update(devotionals)
    .set({
      title: parsed.title,
      slug,
      scriptureReference: parsed.scriptureReference,
      biblePassage: parsed.biblePassage,
      content: parsed.content,
      reflectionPrompt: parsed.reflectionPrompt,
      coverImage: parsed.coverImage,
      authorName: parsed.authorName,
      status: parsed.status,
      publishedAt: new Date(parsed.publishedAt),
      updatedAt: new Date(),
    })
    .where(eq(devotionals.id, id))
    .returning();

  await logAdminActivity({
    actor,
    action: "UPDATE_DEVOTIONAL",
    entityType: "DEVOTIONAL",
    entityId: updated.id,
    summary: `Updated devotional "${updated.title}" (${updated.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.DEVOTIONALS],
    ["/", "/devotionals", `/devotionals/${updated.slug}`, "/admin/devotionals"]
  );

  return updated;
}

export async function updateDevotionalStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [updated] = await db
    .update(devotionals)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(devotionals.id, id))
    .returning();

  if (!updated) {
    throw new Error("Devotional not found.");
  }

  await logAdminActivity({
    actor,
    action: `DEVOTIONAL_STATUS_${status}`,
    entityType: "DEVOTIONAL",
    entityId: updated.id,
    summary: `Changed devotional "${updated.title}" status to ${status}.`,
  });

  invalidateContentCache(
    [CACHE_TAGS.DEVOTIONALS],
    ["/", "/devotionals", `/devotionals/${updated.slug}`, "/admin/devotionals"]
  );

  return updated;
}

export async function deleteDevotionalEntry(id: string) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [deleted] = await db
    .delete(devotionals)
    .where(eq(devotionals.id, id))
    .returning();

  if (!deleted) {
    throw new Error("Devotional not found.");
  }

  await logAdminActivity({
    actor,
    action: "DELETE_DEVOTIONAL",
    entityType: "DEVOTIONAL",
    entityId: deleted.id,
    summary: `Deleted devotional "${deleted.title}".`,
  });

  invalidateContentCache(
    [CACHE_TAGS.DEVOTIONALS],
    ["/", "/devotionals", "/admin/devotionals"]
  );

  return deleted;
}

