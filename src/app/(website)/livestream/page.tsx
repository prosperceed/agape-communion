import Image from "next/image";
import Link from "next/link";
import {
  VideoCameraIcon,
  CalendarDaysIcon,
  PlayCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/website/page-header";
import { getPublicLivestreamOverview } from "@/features/livestream/queries";
import { getPublicChurchSettings } from "@/features/pages/queries";
import { formatDate } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Live Stream & Online Worship",
  description:
    "Join Agape Communion Church online via YouTube Live and Facebook Live for Sunday services and midweek Bible study.",
  path: "/livestream",
});

export default async function LivestreamPage() {
  const [overview, settings] = await Promise.all([
    getPublicLivestreamOverview(),
    getPublicChurchSettings(),
  ]);

  const primaryStream =
    overview.activeStream ?? overview.scheduledStreams[0] ?? null;

  return (
    <div>
      <PageHeader
        kicker="Online Sanctuary"
        title="Sunday & Midweek Livestream"
        subtitle={`Join us online from anywhere in the world. ${settings.livestreamDefaultSchedule}.`}
        backgroundImage="/assets/hero/sunday-livestream-banner.jpg"
      />

      <section className="py-16 bg-white border-b border-slate-200/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          {primaryStream ? (
            <div className="rounded-sm border border-slate-200 bg-white overflow-hidden">
              <div className="bg-[#0B1325] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {primaryStream.status === "LIVE" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      <span className="h-2 w-2 rounded-full bg-white" />
                      Live Broadcast
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#EA580C] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      <ClockIcon className="h-4 w-4" />
                      Scheduled Stream
                    </span>
                  )}
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {primaryStream.platform === "YOUTUBE"
                      ? "YouTube Live"
                      : "Facebook Live"}
                  </span>
                </div>
                <span className="text-xs text-slate-300">
                  {formatDate(
                    primaryStream.scheduledFor,
                    "EEEE, MMMM d, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>

              <div className="relative aspect-video w-full bg-slate-950">
                <iframe
                  src={primaryStream.embedUrl}
                  title={primaryStream.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {primaryStream.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {primaryStream.description}
                  </p>
                </div>
                <div className="shrink-0">
                  <a
                    href={primaryStream.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#EA580C] px-5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#D94E07]"
                  >
                    <VideoCameraIcon className="h-4 w-4" />
                    <span>
                      Watch on{" "}
                      {primaryStream.platform === "YOUTUBE"
                        ? "YouTube"
                        : "Facebook"}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-slate-200 bg-slate-50 p-12 text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                Next Broadcast: {settings.livestreamDefaultSchedule}
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Our livestream player activates automatically before each
                scheduled Sunday and Wednesday service.
              </p>
              <Link
                href="/messages"
                className="inline-flex h-10 items-center justify-center rounded-sm bg-[#EA580C] px-6 text-xs font-semibold uppercase tracking-wider text-white"
              >
                Browse Past Messages
              </Link>
            </div>
          )}
        </div>
      </section>

      {overview.scheduledStreams.length > 0 && (
        <section className="py-16 bg-[#FAFAFA] border-b border-slate-200/70">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
                Upcoming Broadcasts
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                Scheduled Livestreams
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {overview.scheduledStreams.map((stream) => (
                <article
                  key={stream.id}
                  className="rounded-sm border border-slate-200 bg-white p-6 flex flex-col sm:flex-row gap-5 items-start"
                >
                  <div className="relative h-28 w-full sm:w-40 shrink-0 overflow-hidden rounded-sm bg-slate-100">
                    <Image
                      src={stream.thumbnailUrl}
                      alt={stream.title}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#EA580C]">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span>
                        {formatDate(stream.scheduledFor, "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {stream.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {stream.description}
                    </p>
                    <a
                      href={stream.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block pt-1 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#EA580C]"
                    >
                      Open {stream.platform} Link &rarr;
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {overview.previousStreams.length > 0 && (
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Broadcast Archive
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                Previous Livestreams
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {overview.previousStreams.map((stream) => (
                <article
                  key={stream.id}
                  className="rounded-sm border border-slate-200 bg-white overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-video w-full bg-slate-100">
                    <Image
                      src={stream.thumbnailUrl}
                      alt={stream.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {stream.platform} &middot;{" "}
                        {formatDate(stream.scheduledFor)}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {stream.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {stream.description}
                      </p>
                    </div>
                    <a
                      href={stream.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#EA580C] hover:underline pt-2"
                    >
                      <PlayCircleIcon className="h-4 w-4" />
                      <span>Watch Recording</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

