import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  UserIcon,
  PlayCircleIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";
import { getPublishedMessageBySlug } from "@/features/messages/queries";
import { formatDate } from "@/lib/utils";
import { buildPageMetadata, buildVideoJsonLd } from "@/lib/seo";

interface MessageDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MessageDetailPageProps) {
  const { slug } = await params;
  const message = await getPublishedMessageBySlug(slug);
  if (!message) {
    return buildPageMetadata({ title: "Message Not Found", noIndex: true });
  }
  return buildPageMetadata({
    title: `${message.title} by ${message.speaker}`,
    description: message.description,
    path: `/messages/${message.slug}`,
    image: message.thumbnailUrl,
  });
}

export default async function MessageDetailPage({
  params,
}: MessageDetailPageProps) {
  const { slug } = await params;
  const message = await getPublishedMessageBySlug(slug);

  if (!message) {
    notFound();
  }

  const videoJsonLd = buildVideoJsonLd({
    title: message.title,
    description: message.description,
    thumbnailUrl: message.thumbnailUrl,
    uploadDate: message.datePreached,
    embedUrl: message.videoUrl,
  });

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />

      <div className="bg-[#0B1325] text-white py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to All Messages</span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#F97316] pt-2">
            {message.seriesName || message.categoryName || "Sunday Sermon"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {message.title}
          </h1>
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-300 pt-2">
            <span className="inline-flex items-center gap-1.5">
              <UserIcon className="h-4 w-4 text-[#F97316]" />
              {message.speaker}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDaysIcon className="h-4 w-4 text-[#F97316]" />
              {formatDate(message.datePreached)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpenIcon className="h-4 w-4 text-[#F97316]" />
              {message.scriptureReferences}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-900">
          <Image
            src={message.thumbnailUrl}
            alt={message.title}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        <div className="rounded-sm border border-slate-200 bg-[#FAFAFA] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              External Sermon Media Links
            </h2>
            <p className="text-xs text-slate-600">
              Scripture Reading: {message.scriptureReferences}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {message.videoUrl && (
              <a
                href={message.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#EA580C] px-5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#D94E07]"
              >
                <PlayCircleIcon className="h-4 w-4" />
                <span>Watch Video Message</span>
              </a>
            )}
            {message.audioUrl && (
              <a
                href={message.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-sm border border-slate-300 bg-white px-5 text-xs font-semibold uppercase tracking-wider text-slate-800 hover:bg-slate-50"
              >
                <MusicalNoteIcon className="h-4 w-4 text-[#EA580C]" />
                <span>Listen to Audio</span>
              </a>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Message Overview</h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {message.description}
          </p>
        </div>
      </div>
    </article>
  );
}

