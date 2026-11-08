import { and, desc, eq } from "drizzle-orm";
import { getDb, testimonies } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, withExplicitCache } from "@/lib/cache";
import { requireAdminPermission } from "@/lib/auth";

export interface PublicTestimonyCard {
  id: string;
  title: string;
  slug: string;
  publicName: string;
  roleOrRelation: string | null;
  excerpt: string;
  fullTestimony: string;
  imageUrl: string;
  isFeatured: boolean;
  publishedAt: Date | null;
}

function mapToPublicTestimony(
  row: typeof testimonies.$inferSelect
): PublicTestimonyCard {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    publicName: row.displayPersonName ? row.personName : "Church Member",
    roleOrRelation: row.roleOrRelation,
    excerpt: row.excerpt,
    fullTestimony: row.fullTestimony,
    imageUrl: row.imageUrl,
    isFeatured: row.isFeatured,
    publishedAt: row.publishedAt,
  };
}

async function fetchFeaturedTestimoniesUncached(
  limit = 3
): Promise<PublicTestimonyCard[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(testimonies)
    .where(
      and(
        eq(testimonies.status, "PUBLISHED"),
        eq(testimonies.hasStoryPermission, true),
        eq(testimonies.hasMediaPermission, true)
      )
    )
    .orderBy(
      desc(testimonies.isFeatured),
      desc(testimonies.publishedAt),
      desc(testimonies.id)
    )
    .limit(limit);

  return rows.map(mapToPublicTestimony);
}

export const getFeaturedPublishedTestimonies = withExplicitCache(
  fetchFeaturedTestimoniesUncached,
  ["public-featured-testimonies"],
  {
    tags: [CACHE_TAGS.TESTIMONIES],
    revalidate: CACHE_TTL.PUBLISHED_CONTENT,
  }
);

async function fetchAllPublishedTestimoniesUncached(): Promise<
  PublicTestimonyCard[]
> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(testimonies)
    .where(
      and(
        eq(testimonies.status, "PUBLISHED"),
        eq(testimonies.hasStoryPermission, true),
        eq(testimonies.hasMediaPermission, true)
      )
    )
    .orderBy(desc(testimonies.publishedAt), desc(testimonies.id));

  return rows.map(mapToPublicTestimony);
}

export const getAllPublishedTestimonies = withExplicitCache(
  fetchAllPublishedTestimoniesUncached,
  ["public-all-testimonies"],
  {
    tags: [CACHE_TAGS.TESTIMONIES],
    revalidate: CACHE_TTL.PUBLISHED_CONTENT,
  }
);

export async function listAdminTestimonies() {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  return db
    .select()
    .from(testimonies)
    .orderBy(desc(testimonies.createdAt), desc(testimonies.id));
}

export async function getAdminTestimonyById(id: string) {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  const [row] = await db
    .select()
    .from(testimonies)
    .where(eq(testimonies.id, id))
    .limit(1);

  return row ?? null;
}

