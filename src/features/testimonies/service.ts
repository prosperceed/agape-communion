import { and, eq, ne } from "drizzle-orm";
import { getDb, testimonies } from "@/lib/db";
import { logAdminActivity, requireAdminPermission } from "@/lib/auth";
import { CACHE_TAGS, invalidateContentCache } from "@/lib/cache";
import { generateUniqueSlug } from "@/lib/utils";
import {
  publicTestimonySubmissionSchema,
  testimonyAdminInputSchema,
  type PublicTestimonySubmissionInput,
  type TestimonyAdminInput,
} from "./schemas";
import type { TestimonyStatus } from "@/types";

export async function createAdminTestimony(rawInput: TestimonyAdminInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = testimonyAdminInputSchema.parse(rawInput);
  const db = await getDb();

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: testimonies.id })
        .from(testimonies)
        .where(eq(testimonies.slug, candidate))
        .limit(1);
      return Boolean(found);
    }
  );

  const [created] = await db
    .insert(testimonies)
    .values({
      title: parsed.title,
      slug,
      personName: parsed.personName,
      displayPersonName: parsed.displayPersonName,
      hasMediaPermission: parsed.hasMediaPermission,
      hasStoryPermission: parsed.hasStoryPermission,
      roleOrRelation: parsed.roleOrRelation || null,
      excerpt: parsed.excerpt,
      fullTestimony: parsed.fullTestimony,
      imageUrl: parsed.imageUrl,
      isFeatured: parsed.isFeatured,
      status: parsed.status,
      approvedById:
        parsed.status === "APPROVED" || parsed.status === "PUBLISHED"
          ? actor.id
          : null,
      publishedAt: parsed.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();

  await logAdminActivity({
    actor,
    action: "CREATE_TESTIMONY",
    entityType: "TESTIMONY",
    entityId: created.id,
    summary: `Created testimony "${created.title}" (${created.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.TESTIMONIES],
    ["/", "/testimonies", "/admin/testimonies"]
  );

  return created;
}

export async function updateAdminTestimony(
  id: string,
  rawInput: TestimonyAdminInput
) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = testimonyAdminInputSchema.parse(rawInput);
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(testimonies)
    .where(eq(testimonies.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Testimony not found.");
  }

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: testimonies.id })
        .from(testimonies)
        .where(and(eq(testimonies.slug, candidate), ne(testimonies.id, id)))
        .limit(1);
      return Boolean(found);
    }
  );

  const [updated] = await db
    .update(testimonies)
    .set({
      title: parsed.title,
      slug,
      personName: parsed.personName,
      displayPersonName: parsed.displayPersonName,
      hasMediaPermission: parsed.hasMediaPermission,
      hasStoryPermission: parsed.hasStoryPermission,
      roleOrRelation: parsed.roleOrRelation || null,
      excerpt: parsed.excerpt,
      fullTestimony: parsed.fullTestimony,
      imageUrl: parsed.imageUrl,
      isFeatured: parsed.isFeatured,
      status: parsed.status,
      approvedById:
        parsed.status === "APPROVED" || parsed.status === "PUBLISHED"
          ? actor.id
          : existing.approvedById,
      publishedAt:
        parsed.status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(testimonies.id, id))
    .returning();

  await logAdminActivity({
    actor,
    action: "UPDATE_TESTIMONY",
    entityType: "TESTIMONY",
    entityId: updated.id,
    summary: `Updated testimony "${updated.title}" (${updated.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.TESTIMONIES],
    ["/", "/testimonies", "/admin/testimonies"]
  );

  return updated;
}

export async function updateTestimonyStatus(
  id: string,
  status: TestimonyStatus
) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(testimonies)
    .where(eq(testimonies.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Testimony not found.");
  }

  if (
    status === "PUBLISHED" &&
    (!existing.hasStoryPermission || !existing.hasMediaPermission)
  ) {
    throw new Error(
      "Cannot publish testimony without confirmed story and photograph permissions."
    );
  }

  const [updated] = await db
    .update(testimonies)
    .set({
      status,
      approvedById:
        status === "APPROVED" || status === "PUBLISHED"
          ? actor.id
          : existing.approvedById,
      publishedAt:
        status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(testimonies.id, id))
    .returning();

  await logAdminActivity({
    actor,
    action: `TESTIMONY_STATUS_${status}`,
    entityType: "TESTIMONY",
    entityId: updated.id,
    summary: `Changed testimony "${updated.title}" status to ${status}.`,
  });

  invalidateContentCache(
    [CACHE_TAGS.TESTIMONIES],
    ["/", "/testimonies", "/admin/testimonies"]
  );

  return updated;
}

export async function deleteTestimonyEntry(id: string) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [deleted] = await db
    .delete(testimonies)
    .where(eq(testimonies.id, id))
    .returning();

  if (!deleted) {
    throw new Error("Testimony not found.");
  }

  await logAdminActivity({
    actor,
    action: "DELETE_TESTIMONY",
    entityType: "TESTIMONY",
    entityId: deleted.id,
    summary: `Deleted testimony "${deleted.title}".`,
  });

  invalidateContentCache(
    [CACHE_TAGS.TESTIMONIES],
    ["/", "/testimonies", "/admin/testimonies"]
  );

  return deleted;
}

export async function submitPublicTestimony(
  rawInput: PublicTestimonySubmissionInput
) {
  const parsed = publicTestimonySubmissionSchema.parse(rawInput);
  const db = await getDb();

  const slug = await generateUniqueSlug(parsed.title, async (candidate) => {
    const [found] = await db
      .select({ id: testimonies.id })
      .from(testimonies)
      .where(eq(testimonies.slug, candidate))
      .limit(1);
    return Boolean(found);
  });

  const excerpt =
    parsed.fullTestimony.length > 160
      ? `${parsed.fullTestimony.slice(0, 157)}...`
      : parsed.fullTestimony;

  const [submitted] = await db
    .insert(testimonies)
    .values({
      title: parsed.title,
      slug,
      personName: parsed.personName,
      displayPersonName: parsed.displayPersonName,
      hasMediaPermission: parsed.hasMediaPermission,
      hasStoryPermission: parsed.hasStoryPermission,
      roleOrRelation: parsed.roleOrRelation || "Church Congregation",
      excerpt,
      fullTestimony: parsed.fullTestimony,
      imageUrl: "/assets/testimonies/family-restoration.jpg",
      isFeatured: false,
      status: "PENDING",
    })
    .returning();

  return submitted;
}

