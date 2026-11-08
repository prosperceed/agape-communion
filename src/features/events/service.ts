import { and, eq, ne } from "drizzle-orm";
import { getDb, events } from "@/lib/db";
import { logAdminActivity, requireAdminPermission } from "@/lib/auth";
import { CACHE_TAGS, invalidateContentCache } from "@/lib/cache";
import { generateUniqueSlug } from "@/lib/utils";
import { eventInputSchema, type EventInput } from "./schemas";

export async function createEventEntry(rawInput: EventInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = eventInputSchema.parse(rawInput);
  const db = await getDb();

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: events.id })
        .from(events)
        .where(eq(events.slug, candidate))
        .limit(1);
      return Boolean(found);
    }
  );

  const [created] = await db
    .insert(events)
    .values({
      title: parsed.title,
      slug,
      excerpt: parsed.excerpt,
      description: parsed.description,
      coverImage: parsed.coverImage,
      startDate: new Date(parsed.startDate),
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      venue: parsed.venue,
      registrationUrl: parsed.registrationUrl || null,
      isFeatured: parsed.isFeatured,
      status: parsed.status,
      authorId: actor.id,
      publishedAt: parsed.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();

  await logAdminActivity({
    actor,
    action: "CREATE_EVENT",
    entityType: "EVENT",
    entityId: created.id,
    summary: `Created event "${created.title}" (${created.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.EVENTS],
    ["/", "/events", `/events/${created.slug}`, "/admin/events"]
  );

  return created;
}

export async function updateEventEntry(id: string, rawInput: EventInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = eventInputSchema.parse(rawInput);
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Event not found.");
  }

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: events.id })
        .from(events)
        .where(and(eq(events.slug, candidate), ne(events.id, id)))
        .limit(1);
      return Boolean(found);
    }
  );

  const [updated] = await db
    .update(events)
    .set({
      title: parsed.title,
      slug,
      excerpt: parsed.excerpt,
      description: parsed.description,
      coverImage: parsed.coverImage,
      startDate: new Date(parsed.startDate),
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      venue: parsed.venue,
      registrationUrl: parsed.registrationUrl || null,
      isFeatured: parsed.isFeatured,
      status: parsed.status,
      publishedAt:
        parsed.status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();

  await logAdminActivity({
    actor,
    action: "UPDATE_EVENT",
    entityType: "EVENT",
    entityId: updated.id,
    summary: `Updated event "${updated.title}" (${updated.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.EVENTS],
    ["/", "/events", `/events/${updated.slug}`, "/admin/events"]
  );

  return updated;
}

export async function updateEventStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [updated] = await db
    .update(events)
    .set({
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();

  if (!updated) {
    throw new Error("Event not found.");
  }

  await logAdminActivity({
    actor,
    action: `EVENT_STATUS_${status}`,
    entityType: "EVENT",
    entityId: updated.id,
    summary: `Changed event "${updated.title}" status to ${status}.`,
  });

  invalidateContentCache(
    [CACHE_TAGS.EVENTS],
    ["/", "/events", `/events/${updated.slug}`, "/admin/events"]
  );

  return updated;
}

export async function deleteEventEntry(id: string) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [deleted] = await db
    .delete(events)
    .where(eq(events.id, id))
    .returning();

  if (!deleted) {
    throw new Error("Event not found.");
  }

  await logAdminActivity({
    actor,
    action: "DELETE_EVENT",
    entityType: "EVENT",
    entityId: deleted.id,
    summary: `Deleted event "${deleted.title}".`,
  });

  invalidateContentCache(
    [CACHE_TAGS.EVENTS],
    ["/", "/events", "/admin/events"]
  );

  return deleted;
}

