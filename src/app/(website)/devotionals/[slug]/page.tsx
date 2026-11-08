import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { getPublishedDevotionalBySlug } from "@/features/devotionals/queries";
import { formatDate } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";

interface DevotionalDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DevotionalDetailPageProps) {
  const { slug } = await params;
  const devotional = await getPublishedDevotionalBySlug(slug);
  if (!devotional) {
    return buildPageMetadata({ title: "Devotional Not Found", noIndex: true });
  }
  return buildPageMetadata({
    title: `${devotional.title} (${devotional.scriptureReference})`,
    description: devotional.biblePassage,
    path: `/devotionals/${devotional.slug}`,
    image: devotional.coverImage,
    type: "article",
  });
}

export default async function DevotionalDetailPage({
  params,
}: DevotionalDetailPageProps) {
  const { slug } = await params;
  const devotional = await getPublishedDevotionalBySlug(slug);

  if (!devotional) {
    notFound();
  }

  return (
    <article className="pb-20">
      <div className="bg-[#0B1325] text-white py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            href="/devotionals"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Devotionals</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#F97316] pt-2">
            <BookOpenIcon className="h-4 w-4" />
            <span>{devotional.scriptureReference}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {devotional.title}
          </h1>
          <p className="text-sm text-slate-300">
            {formatDate(devotional.publishedAt, "EEEE, MMMM d, yyyy")} &middot;{" "}
            {devotional.authorName}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        <div className="rounded-sm border border-orange-200 bg-orange-50/50 p-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Scripture Reading: {devotional.scriptureReference}
          </p>
          <blockquote className="text-base italic text-slate-800 leading-relaxed">
            &ldquo;{devotional.biblePassage}&rdquo;
          </blockquote>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
          <Image
            src={devotional.coverImage}
            alt={devotional.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        <div
          className="prose-church text-slate-700"
          dangerouslySetInnerHTML={{ __html: devotional.content }}
        />

        <div className="rounded-sm border border-slate-200 bg-[#0B1325] text-white p-6 sm:p-8 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#F97316]">
            Prayer & Reflection
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {devotional.reflectionPrompt}
          </p>
        </div>
      </div>
    </article>
  );
}

