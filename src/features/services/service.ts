import { and, eq, ne } from "drizzle-orm";
import { getDb, services, serviceSchedules } from "@/lib/db";
import { logAdminActivity, requireAdminPermission } from "@/lib/auth";
import { CACHE_TAGS, invalidateContentCache } from "@/lib/cache";
import { generateUniqueSlug } from "@/lib/utils";
import { serviceInputSchema, type ServiceInput } from "./schemas";

export async function createServiceEntry(rawInput: ServiceInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = serviceInputSchema.parse(rawInput);
  const db = await getDb();

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: services.id })
        .from(services)
        .where(eq(services.slug, candidate))
        .limit(1);
      return Boolean(found);
    }
  );

  const created = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(services)
      .values({
        title: parsed.title,
        slug,
        description: parsed.description,
        location: parsed.location || null,
        imageUrl: parsed.imageUrl || null,
        isRecurring: parsed.isRecurring,
        eventDate:
          !parsed.isRecurring && parsed.eventDate
            ? new Date(parsed.eventDate)
            : null,
        status: parsed.status,
        displayOrder: parsed.displayOrder,
        authorId: actor.id,
        publishedAt: parsed.status === "PUBLISHED" ? new Date() : null,
      })
      .returning();

    if (parsed.schedules.length > 0) {
      await tx.insert(serviceSchedules).values(
        parsed.schedules.map((s) => ({
          serviceId: inserted.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          frequency: s.frequency,
          notes: s.notes || null,
        }))
      );
    }

    return inserted;
  });

  await logAdminActivity({
    actor,
    action: "CREATE_SERVICE",
    entityType: "SERVICE",
    entityId: created.id,
    summary: `Created service programme "${created.title}" (${created.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.SERVICES],
    ["/", "/services", "/admin/services"]
  );

  return created;
}

export async function updateServiceEntry(id: string, rawInput: ServiceInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = serviceInputSchema.parse(rawInput);
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Service programme not found.");
  }

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: services.id })
        .from(services)
        .where(and(eq(services.slug, candidate), ne(services.id, id)))
        .limit(1);
      return Boolean(found);
    }
  );

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(services)
      .set({
        title: parsed.title,
        slug,
        description: parsed.description,
        location: parsed.location || null,
        imageUrl: parsed.imageUrl || null,
        isRecurring: parsed.isRecurring,
        eventDate:
          !parsed.isRecurring && parsed.eventDate
            ? new Date(parsed.eventDate)
            : null,
        status: parsed.status,
        displayOrder: parsed.displayOrder,
        publishedAt:
          parsed.status === "PUBLISHED"
            ? existing.publishedAt ?? new Date()
            : existing.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id))
      .returning();

    await tx
      .delete(serviceSchedules)
      .where(eq(serviceSchedules.serviceId, id));

    if (parsed.schedules.length > 0) {
      await tx.insert(serviceSchedules).values(
        parsed.schedules.map((s) => ({
          serviceId: id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          frequency: s.frequency,
          notes: s.notes || null,
        }))
      );
    }

    return row;
  });

  await logAdminActivity({
    actor,
    action: "UPDATE_SERVICE",
    entityType: "SERVICE",
    entityId: updated.id,
    summary: `Updated service programme "${updated.title}" (${updated.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.SERVICES],
    ["/", "/services", "/admin/services"]
  );

  return updated;
}

export async function updateServiceStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [updated] = await db
    .update(services)
    .set({
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id))
    .returning();

  if (!updated) {
    throw new Error("Service programme not found.");
  }

  await logAdminActivity({
    actor,
    action: `SERVICE_STATUS_${status}`,
    entityType: "SERVICE",
    entityId: updated.id,
    summary: `Changed service "${updated.title}" status to ${status}.`,
  });

  invalidateContentCache(
    [CACHE_TAGS.SERVICES],
    ["/", "/services", "/admin/services"]
  );

  return updated;
}

export async function deleteServiceEntry(id: string) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [deleted] = await db
    .delete(services)
    .where(eq(services.id, id))
    .returning();

  if (!deleted) {
    throw new Error("Service programme not found.");
  }

  await logAdminActivity({
    actor,
    action: "DELETE_SERVICE",
    entityType: "SERVICE",
    entityId: deleted.id,
    summary: `Deleted service programme "${deleted.title}".`,
  });

  invalidateContentCache(
    [CACHE_TAGS.SERVICES],
    ["/", "/services", "/admin/services"]
  );

  return deleted;
}
