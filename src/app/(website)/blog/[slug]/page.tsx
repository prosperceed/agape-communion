import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getPublishedPostBySlug } from "@/features/blog/queries";
import { formatDate } from "@/lib/utils";
import { buildArticleJsonLd, buildPageMetadata } from "@/lib/seo";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return buildPageMetadata({ title: "Article Not Found", noIndex: true });
  }

  return buildPageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    type: "article",
    publishedTime: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : undefined,
  });
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = buildArticleJsonLd(post);

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#0B1325] text-white py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Church Blog</span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#F97316] pt-2">
            {post.categoryName || "Christian Living"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {post.title}
          </h1>
          <p className="text-sm text-slate-300">
            By <span className="font-semibold text-white">{post.authorName}</span>{" "}
            &middot; Published on{" "}
            {formatDate(post.publishedAt ?? post.createdAt)}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        <div
          className="prose-church text-slate-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-6">
            <span className="text-xs font-semibold text-slate-500">Tags:</span>
            {post.tags.map((t) => (
              <span
                key={t.id}
                className="rounded-sm bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

