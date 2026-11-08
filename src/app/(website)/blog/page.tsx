import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/website/page-header";
import {
  getPaginatedPublishedPosts,
  listBlogCategories,
} from "@/features/blog/queries";
import { formatDate } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Church Blog & Articles",
  description:
    "Read biblical reflections, teaching articles, and practical Christian living guides from Agape Communion Church.",
  path: "/blog",
});

interface BlogListingPageProps {
  searchParams: Promise<{ cursor?: string; category?: string }>;
}

export default async function BlogListingPage({
  searchParams,
}: BlogListingPageProps) {
  const { cursor, category } = await searchParams;
  const [paginatedPosts, categories] = await Promise.all([
    getPaginatedPublishedPosts({
      cursor,
      limit: 6,
      categorySlug: category,
    }),
    listBlogCategories("BLOG"),
  ]);

  return (
    <div>
      <PageHeader
        kicker="Articles & Reflections"
        title="Church Blog"
        subtitle="Thoughtful biblical articles, pastoral encouragement, and practical insights for everyday Christian living."
        backgroundImage="/assets/blog/abiding-in-the-living-word.jpg"
      />

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-6">
              <Link
                href="/blog"
                className={`rounded-sm px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !category
                    ? "bg-[#EA580C] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${encodeURIComponent(cat.slug)}`}
                  className={`rounded-sm px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    category === cat.slug
                      ? "bg-[#EA580C] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {paginatedPosts.items.length === 0 ? (
            <div className="rounded-sm border border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm text-slate-600">
                No published articles found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.items.map((post) => (
                <article
                  key={post.id}
                  className="rounded-sm border border-slate-200 bg-white overflow-hidden flex flex-col"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative aspect-[16/10] w-full bg-slate-100"
                  >
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </Link>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#EA580C]">
                        <span>{post.categoryName || "Christian Living"}</span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-[#EA580C] transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.map((t) => (
                            <span
                              key={t.id}
                              className="rounded-sm bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                            >
                              #{t.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {post.authorName} &middot;{" "}
                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-[#EA580C]"
                        >
                          <span>Read</span>
                          <ArrowRightIcon className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {paginatedPosts.hasMore && paginatedPosts.nextCursor && (
            <div className="flex justify-center pt-6">
              <Link
                href={`/blog?cursor=${encodeURIComponent(
                  paginatedPosts.nextCursor
                )}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
                className="inline-flex h-10 items-center justify-center rounded-sm border border-slate-300 bg-white px-6 text-xs font-semibold uppercase tracking-wider text-slate-900 hover:bg-slate-50"
              >
                Load Older Articles
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

