import Image from "next/image";
import Link from "next/link";
import {
  CalendarDaysIcon,
  MapPinIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/website/page-header";
import {
  getUpcomingPublishedEvents,
  getPastPublishedEvents,
} from "@/features/events/queries";
import { formatDate } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Church Events & Gatherings",
  description:
    "Discover upcoming worship nights, conferences, youth summits, and community outreach events at Agape Communion Church in Lagos.",
  path: "/events",
});

export default async function EventsPage() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    getUpcomingPublishedEvents(12),
    getPastPublishedEvents(6),
  ]);

  return (
    <div>
      <PageHeader
        kicker="Church Calendar"
        title="Events & Special Gatherings"
        subtitle="Join our church family for seasonal conferences, worship nights, youth summits, and community outreach across Lagos."
        backgroundImage="/assets/events/night-of-worship.jpg"
      />

      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2 mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
              Upcoming Gatherings
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Upcoming Events
            </h2>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="rounded-sm border border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm text-slate-600">
                No upcoming special events are currently scheduled. Check our
                regular weekly services for ongoing fellowships.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-sm border border-slate-200 bg-white overflow-hidden flex flex-col"
                >
                  <Link
                    href={`/events/${event.slug}`}
                    className="relative aspect-[16/10] w-full bg-slate-100"
                  >
                    <Image
                      src={event.coverImage}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-sm bg-[#EA580C] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                      Upcoming
                    </span>
                  </Link>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#EA580C]">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <time dateTime={new Date(event.startDate).toISOString()}>
                          {formatDate(event.startDate, "MMMM d, yyyy 'at' h:mm a")}
                        </time>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        <Link
                          href={`/events/${event.slug}`}
                          className="hover:text-[#EA580C] transition-colors"
                        >
                          {event.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {event.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">{event.venue}</span>
                      </p>
                      <Link
                        href={`/events/${event.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#EA580C]"
                      >
                        <span>Event Details</span>
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {pastEvents.length > 0 && (
        <section className="py-20 bg-[#FAFAFA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2 mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Archive
              </p>
              <h2 className="text-2xl font-bold text-slate-900">Past Events</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {pastEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-sm border border-slate-200 bg-white p-5 space-y-2.5"
                >
                  <span className="inline-block rounded-sm bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                    Past Event &middot; {formatDate(event.startDate)}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    <Link
                      href={`/events/${event.slug}`}
                      className="hover:text-[#EA580C]"
                    >
                      {event.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {event.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

