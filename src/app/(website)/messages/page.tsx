import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/website/page-header";
import { getPaginatedPublishedMessages } from "@/features/messages/queries";
import { formatDate } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sermons & Messages",
  description:
    "Watch and listen to Christ-centered sermons and Bible teachings from Agape Communion Church in Lagos, Nigeria.",
  path: "/messages",
});

interface MessagesListingPageProps {
  searchParams: Promise<{ cursor?: string }>;
}

export default async function MessagesListingPage({
  searchParams,
}: MessagesListingPageProps) {
  const { cursor } = await searchParams;
  const paginatedMessages = await getPaginatedPublishedMessages({
    cursor,
    limit: 6,
  });

  return (
    <div>
      <PageHeader
        kicker="Preaching of the Word"
        title="Sermons & Messages"
        subtitle="Explore our archive of Sunday and midweek messages rooted in faithful exposition of Scripture."
        backgroundImage="/assets/messages/renewing-your-mind.jpg"
      />

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedMessages.items.map((msg) => (
              <article
                key={msg.id}
                className="group rounded-sm border border-slate-200 bg-white overflow-hidden flex flex-col"
              >
                <Link
                  href={`/messages/${msg.slug}`}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100"
                >
                  <Image
                    src={msg.thumbnailUrl}
                    alt={msg.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#EA580C]">
                      {(
                        msg.seriesName ||
                        msg.categoryName ||
                        "SUNDAY MESSAGE"
                      ).toUpperCase()}{" "}
                      | PAST MESSAGES
                    </p>
                    <h2 className="text-lg font-bold text-slate-900">
                      <Link
                        href={`/messages/${msg.slug}`}
                        className="hover:text-[#EA580C] transition-colors"
                      >
                        {msg.title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <UserIcon className="h-3.5 w-3.5 text-[#EA580C]" />
                        {msg.speaker}
                      </span>
                      <span>&middot;</span>
                      <span>{formatDate(msg.datePreached)}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 pt-1">
                      {msg.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                      <BookOpenIcon className="h-3.5 w-3.5 text-[#EA580C]" />
                      {msg.scriptureReferences}
                    </span>
                    <Link
                      href={`/messages/${msg.slug}`}
                      className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-slate-900 hover:text-[#EA580C]"
                    >
                      <span>Listen</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {paginatedMessages.hasMore && paginatedMessages.nextCursor && (
            <div className="flex justify-center pt-4">
              <Link
                href={`/messages?cursor=${encodeURIComponent(
                  paginatedMessages.nextCursor
                )}`}
                className="inline-flex h-10 items-center justify-center rounded-sm border border-slate-300 bg-white px-6 text-xs font-semibold uppercase tracking-wider text-slate-900 hover:bg-slate-50"
              >
                Load Older Messages
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

