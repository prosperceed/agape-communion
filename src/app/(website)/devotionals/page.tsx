import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/website/page-header";
import { getPaginatedPublishedDevotionals } from "@/features/devotionals/queries";
import { formatDate } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Daily Devotionals",
  description:
    "Chronological daily devotionals with Scripture passages, biblical reflections, and guided prayers from Agape Communion Church.",
  path: "/devotionals",
});

interface DevotionalsPageProps {
  searchParams: Promise<{ cursor?: string }>;
}

export default async function DevotionalsPage({
  searchParams,
}: DevotionalsPageProps) {
  const { cursor } = await searchParams;
  const paginatedDevotionals = await getPaginatedPublishedDevotionals({
    cursor,
    limit: 6,
  });

  return (
    <div>
      <PageHeader
        kicker="Daily Communion With God"
        title="Daily Devotionals"
        subtitle="Begin each day with Scripture meditation, expositional reflection, and focused prayer."
        backgroundImage="/assets/blog/finding-peace-in-the-psalms.jpg"
      />

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          {paginatedDevotionals.items.map((item) => (
            <article
              key={item.id}
              className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start"
            >
              <Link
                href={`/devotionals/${item.slug}`}
                className="relative h-44 w-full md:w-56 shrink-0 overflow-hidden rounded-sm bg-slate-100"
              >
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 224px"
                  className="object-cover"
                />
              </Link>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#EA580C]">
                    <BookOpenIcon className="h-4 w-4" />
                    {item.scriptureReference}
                  </span>
                  <span className="text-slate-400">&middot;</span>
                  <time
                    dateTime={new Date(item.publishedAt).toISOString()}
                    className="text-slate-500"
                  >
                    {formatDate(item.publishedAt, "EEEE, MMMM d, yyyy")}
                  </time>
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  <Link
                    href={`/devotionals/${item.slug}`}
                    className="hover:text-[#EA580C] transition-colors"
                  >
                    {item.title}
                  </Link>
                </h2>

                <blockquote className="border-l-2 border-[#EA580C] pl-3.5 text-sm italic text-slate-600">
                  &ldquo;{item.biblePassage}&rdquo;
                </blockquote>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Written by {item.authorName}</span>
                  <Link
                    href={`/devotionals/${item.slug}`}
                    className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-slate-900 hover:text-[#EA580C]"
                  >
                    <span>Read Devotional</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {paginatedDevotionals.hasMore && paginatedDevotionals.nextCursor && (
            <div className="flex justify-center pt-4">
              <Link
                href={`/devotionals?cursor=${encodeURIComponent(
                  paginatedDevotionals.nextCursor
                )}`}
                className="inline-flex h-10 items-center justify-center rounded-sm border border-slate-300 bg-white px-6 text-xs font-semibold uppercase tracking-wider text-slate-900 hover:bg-slate-50"
              >
                Browse Earlier Devotionals
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

