import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDaysIcon,
  MapPinIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { getPublishedEventBySlug } from "@/features/events/queries";
import { formatDate } from "@/lib/utils";
import { buildEventJsonLd, buildPageMetadata } from "@/lib/seo";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) {
    return buildPageMetadata({ title: "Event Not Found", noIndex: true });
  }
  return buildPageMetadata({
    title: event.title,
    description: event.excerpt,
    path: `/events/${event.slug}`,
    image: event.coverImage,
  });
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const isUpcoming = new Date(event.startDate).getTime() >= Date.now();
  const jsonLd = buildEventJsonLd(event);

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#0B1325] text-white py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to All Events</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span
              className={`rounded-sm px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                isUpcoming
                  ? "bg-[#EA580C] text-white"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {isUpcoming ? "Upcoming Event" : "Past Event"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-[#F97316]" />
              <span>
                {formatDate(event.startDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-[#F97316]" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div
              className="prose-church text-slate-700"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-sm border border-slate-200 bg-[#FAFAFA] p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Event Information
              </h2>
              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">Date & Time</p>
                  <p>{formatDate(event.startDate, "MMMM d, yyyy 'at' h:mm a")}</p>
                  {event.endDate && (
                    <p className="text-slate-500">
                      Ends: {formatDate(event.endDate, "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Venue</p>
                  <p>{event.venue}</p>
                </div>
              </div>

              {event.registrationUrl && isUpcoming && (
                <div className="pt-2">
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-full items-center justify-center rounded-sm bg-[#EA580C] px-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#D94E07]"
                  >
                    Register for Event
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

