import { and, eq, ne } from "drizzle-orm";
import { getDb, posts, categories, tags, postTags } from "@/lib/db";
import { logAdminActivity, requireAdminPermission } from "@/lib/auth";
import { CACHE_TAGS, invalidateContentCache } from "@/lib/cache";
import { generateUniqueSlug, slugify } from "@/lib/utils";
import {
  blogPostInputSchema,
  categoryInputSchema,
  type BlogPostInput,
  type CategoryInput,
} from "./schemas";

async function syncPostTagsInTx(
  tx: Awaited<ReturnType<typeof getDb>>,
  postId: string,
  tagNames: string[]
) {
  await tx.delete(postTags).where(eq(postTags.postId, postId));

  const cleanNames = Array.from(
    new Set(tagNames.map((t) => t.trim()).filter(Boolean))
  );

  for (const name of cleanNames) {
    const tagSlug = slugify(name);
    if (!tagSlug) continue;

    let [existingTag] = await tx
      .select()
      .from(tags)
      .where(eq(tags.slug, tagSlug))
      .limit(1);

    if (!existingTag) {
      [existingTag] = await tx
        .insert(tags)
        .values({ name, slug: tagSlug })
        .returning();
    }

    await tx.insert(postTags).values({
      postId,
      tagId: existingTag.id,
    });
  }
}

export async function createBlogPost(rawInput: BlogPostInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = blogPostInputSchema.parse(rawInput);
  const db = await getDb();

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.slug, candidate))
        .limit(1);
      return Boolean(found);
    }
  );

  const created = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(posts)
      .values({
        title: parsed.title,
        slug,
        excerpt: parsed.excerpt,
        content: parsed.content,
        coverImage: parsed.coverImage,
        categoryId: parsed.categoryId || null,
        authorId: actor.id,
        authorName: parsed.authorName,
        status: parsed.status,
        seoTitle: parsed.seoTitle || parsed.title,
        seoDescription: parsed.seoDescription || parsed.excerpt,
        publishedAt: parsed.status === "PUBLISHED" ? new Date() : null,
      })
      .returning();

    await syncPostTagsInTx(
      tx as unknown as Awaited<ReturnType<typeof getDb>>,
      inserted.id,
      parsed.tagNames
    );

    return inserted;
  });

  await logAdminActivity({
    actor,
    action: "CREATE_POST",
    entityType: "POST",
    entityId: created.id,
    summary: `Created blog post "${created.title}" (${created.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.POSTS],
    ["/", "/blog", `/blog/${created.slug}`, "/admin/blog"]
  );

  return created;
}

export async function updateBlogPost(id: string, rawInput: BlogPostInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = blogPostInputSchema.parse(rawInput);
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Blog post not found.");
  }

  const slug = await generateUniqueSlug(
    parsed.slug || parsed.title,
    async (candidate) => {
      const [found] = await db
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.slug, candidate), ne(posts.id, id)))
        .limit(1);
      return Boolean(found);
    }
  );

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(posts)
      .set({
        title: parsed.title,
        slug,
        excerpt: parsed.excerpt,
        content: parsed.content,
        coverImage: parsed.coverImage,
        categoryId: parsed.categoryId || null,
        authorName: parsed.authorName,
        status: parsed.status,
        seoTitle: parsed.seoTitle || parsed.title,
        seoDescription: parsed.seoDescription || parsed.excerpt,
        publishedAt:
          parsed.status === "PUBLISHED"
            ? existing.publishedAt ?? new Date()
            : existing.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    await syncPostTagsInTx(
      tx as unknown as Awaited<ReturnType<typeof getDb>>,
      id,
      parsed.tagNames
    );

    return row;
  });

  await logAdminActivity({
    actor,
    action: "UPDATE_POST",
    entityType: "POST",
    entityId: updated.id,
    summary: `Updated blog post "${updated.title}" (${updated.status}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.POSTS],
    ["/", "/blog", `/blog/${updated.slug}`, "/admin/blog"]
  );

  return updated;
}

export async function updateBlogPostStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [updated] = await db
    .update(posts)
    .set({
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  if (!updated) {
    throw new Error("Blog post not found.");
  }

  await logAdminActivity({
    actor,
    action: `POST_STATUS_${status}`,
    entityType: "POST",
    entityId: updated.id,
    summary: `Changed blog post "${updated.title}" status to ${status}.`,
  });

  invalidateContentCache(
    [CACHE_TAGS.POSTS],
    ["/", "/blog", `/blog/${updated.slug}`, "/admin/blog"]
  );

  return updated;
}

export async function deleteBlogPost(id: string) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [deleted] = await db
    .delete(posts)
    .where(eq(posts.id, id))
    .returning();

  if (!deleted) {
    throw new Error("Blog post not found.");
  }

  await logAdminActivity({
    actor,
    action: "DELETE_POST",
    entityType: "POST",
    entityId: deleted.id,
    summary: `Deleted blog post "${deleted.title}".`,
  });

  invalidateContentCache([CACHE_TAGS.POSTS], ["/", "/blog", "/admin/blog"]);
  return deleted;
}

export async function createContentCategory(rawInput: CategoryInput) {
  const actor = await requireAdminPermission("MANAGE_CONTENT");
  const parsed = categoryInputSchema.parse(rawInput);
  const db = await getDb();

  const slug = await generateUniqueSlug(parsed.name, async (candidate) => {
    const [found] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, candidate))
      .limit(1);
    return Boolean(found);
  });

  const [created] = await db
    .insert(categories)
    .values({
      name: parsed.name,
      slug,
      scope: parsed.scope,
      description: parsed.description || null,
    })
    .returning();

  await logAdminActivity({
    actor,
    action: "CREATE_CATEGORY",
    entityType: "CATEGORY",
    entityId: created.id,
    summary: `Created ${created.scope} category "${created.name}".`,
  });

  invalidateContentCache([CACHE_TAGS.CATEGORIES, CACHE_TAGS.POSTS]);
  return created;
}

