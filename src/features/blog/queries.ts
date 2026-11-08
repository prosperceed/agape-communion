import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { getDb, posts, categories, tags, postTags } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, withExplicitCache } from "@/lib/cache";
import { requireAdminPermission } from "@/lib/auth";
import { decodeCompositeCursor, encodeCompositeCursor } from "@/lib/utils";
import type { CursorPaginationParams, PaginatedResult } from "@/types";

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  categoryId: string | null;
  categoryName: string | null;
  authorName: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date | null;
  createdAt: Date;
  tags: Array<{ id: string; name: string; slug: string }>;
}

async function attachTagsToPostItems<T extends { id: string }>(
  items: T[]
): Promise<Array<T & { tags: Array<{ id: string; name: string; slug: string }> }>> {
  if (items.length === 0) return [];
  const db = await getDb();
  const postIds = items.map((p) => p.id);

  const tagLinks = await db
    .select({
      postId: postTags.postId,
      tagId: tags.id,
      tagName: tags.name,
      tagSlug: tags.slug,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, postIds));

  const mapByPost = new Map<
    string,
    Array<{ id: string; name: string; slug: string }>
  >();

  for (const row of tagLinks) {
    const arr = mapByPost.get(row.postId) ?? [];
    arr.push({ id: row.tagId, name: row.tagName, slug: row.tagSlug });
    mapByPost.set(row.postId, arr);
  }

  return items.map((item) => ({
    ...item,
    tags: mapByPost.get(item.id) ?? [],
  }));
}

async function fetchLatestPostsUncached(limit = 3): Promise<BlogPostListItem[]> {
  const db = await getDb();
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      categoryId: posts.categoryId,
      categoryName: categories.name,
      authorName: posts.authorName,
      status: posts.status,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.status, "PUBLISHED"))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(limit);

  return attachTagsToPostItems(rows);
}

export const getLatestPublishedPosts = withExplicitCache(
  fetchLatestPostsUncached,
  ["public-latest-posts"],
  {
    tags: [CACHE_TAGS.POSTS],
    revalidate: CACHE_TTL.PUBLISHED_CONTENT,
  }
);

export async function getPaginatedPublishedPosts(
  params: CursorPaginationParams & { categorySlug?: string } = {}
): Promise<PaginatedResult<BlogPostListItem>> {
  const db = await getDb();
  const limit = Math.min(Math.max(params.limit ?? 6, 1), 30);
  const decoded = decodeCompositeCursor(params.cursor);

  const conditions = [eq(posts.status, "PUBLISHED")];

  if (params.categorySlug) {
    conditions.push(eq(categories.slug, params.categorySlug));
  }

  if (decoded) {
    conditions.push(
      or(
        lt(posts.publishedAt, decoded.timestamp),
        and(
          eq(posts.publishedAt, decoded.timestamp),
          sql`${posts.id} < ${decoded.id}`
        )
      )!
    );
  }

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      categoryId: posts.categoryId,
      categoryName: categories.name,
      authorName: posts.authorName,
      status: posts.status,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;
  const items = await attachTagsToPostItems(sliced);

  const lastItem = items[items.length - 1];
  const nextCursor =
    hasMore && lastItem
      ? encodeCompositeCursor(
          lastItem.publishedAt ?? lastItem.createdAt,
          lastItem.id
        )
      : null;

  return { items, nextCursor, hasMore };
}

export async function getPublishedPostBySlug(slug: string) {
  const db = await getDb();
  const [row] = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      coverImage: posts.coverImage,
      categoryId: posts.categoryId,
      categoryName: categories.name,
      authorName: posts.authorName,
      status: posts.status,
      seoTitle: posts.seoTitle,
      seoDescription: posts.seoDescription,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, "PUBLISHED")))
    .limit(1);

  if (!row) return null;
  const [withTags] = await attachTagsToPostItems([row]);
  return withTags ?? null;
}

export async function listBlogCategories(scope: "BLOG" | "MESSAGE" = "BLOG") {
  const db = await getDb();
  return db
    .select()
    .from(categories)
    .where(eq(categories.scope, scope))
    .orderBy(categories.name);
}

export async function listAdminPosts(): Promise<BlogPostListItem[]> {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      categoryId: posts.categoryId,
      categoryName: categories.name,
      authorName: posts.authorName,
      status: posts.status,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .orderBy(desc(posts.createdAt), desc(posts.id));

  return attachTagsToPostItems(rows);
}

export async function getAdminPostById(id: string) {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  const [row] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!row) return null;
  const [withTags] = await attachTagsToPostItems([row]);
  return withTags ?? null;
}

