import Link from "next/link";
import Image from "next/image";
import {
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  HeartIcon,
  HandRaisedIcon,
  ArrowRightIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";
import type { ChurchSettingsData } from "@/features/pages/queries";
import type { ServiceWithSchedules } from "@/features/services/queries";
import type { MessageListItem } from "@/features/messages/queries";
import type { EventListItem } from "@/features/events/queries";
import type { DevotionalListItem } from "@/features/devotionals/queries";
import type { BlogPostListItem } from "@/features/blog/queries";
import type { PublicTestimonyCard } from "@/features/testimonies/queries";
import type { LivestreamRecord } from "@/features/livestream/queries";

const SERVICE_ICONS = [
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  HeartIcon,
  HandRaisedIcon,
];

export function HeroAndLivestreamSection({
  settings,
  activeStream,
}: {
  settings: ChurchSettingsData;
  activeStream: LivestreamRecord | null;
}) {
  return (
    <section className="relative">
      <div className="relative bg-[#0B1325] text-white overflow-hidden pb-36 pt-16 sm:pt-24 sm:pb-44">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hero/worship-sanctuary.jpg"
            alt="Agape Communion Church congregation in worship"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-[#0B1325]/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              {settings.tagline}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
              Welcome To
              <br />
              Our Church
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {settings.aboutIntro}
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center rounded-sm bg-[#EA580C] px-7 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#D94E07]"
              >
                I&apos;m New Here
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto max-w-4xl px-4 sm:px-6 -mt-24">
        <div className="rounded-sm border border-slate-100 bg-white p-5 sm:p-7 shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="relative h-36 w-full sm:w-56 shrink-0 overflow-hidden rounded-sm bg-slate-900">
              <Image
                src={
                  activeStream?.thumbnailUrl ||
                  "/assets/hero/sunday-livestream-banner.jpg"
                }
                alt="Sunday Live Stream Worship"
                fill
                sizes="(max-width: 640px) 100vw, 224px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {activeStream?.status === "LIVE" && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    Live Now
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Join the Sunday Live Stream
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {settings.livestreamDefaultSchedule}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-5">
                <Link
                  href="/livestream"
                  className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-[#EA580C] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#D94E07]"
                >
                  <span>Join Now</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/messages"
                  className="text-xs font-semibold text-slate-700 hover:text-[#EA580C] transition-colors"
                >
                  Past Messages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeServicesSection({
  services,
}: {
  services: ServiceWithSchedules[];
}) {
  const displayServices = services.slice(0, 6);

  return (
    <section className="bg-[#FAFAFA] pt-28 pb-20 -mt-14 border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Our Services
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              We Love Serving Our Local Community
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every week at Agape Communion Church, we gather across Lagos for
              Christ-centered worship, verse-by-verse teaching of Scripture, and
              supportive fellowship for every generation.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Whether you are exploring faith or seeking a spiritual home to
              grow and serve, there is a place for you and your family.
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex h-10 items-center justify-center rounded-sm bg-[#EA580C] px-6 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#D94E07]"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {displayServices.map((service, index) => {
              const IconComponent =
                SERVICE_ICONS[index % SERVICE_ICONS.length];
              const primarySchedule = service.schedules[0];

              return (
                <div key={service.id} className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-slate-300 bg-white text-slate-800">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                  {primarySchedule && (
                    <p className="text-xs font-medium text-[#EA580C]">
                      {primarySchedule.dayOfWeek.charAt(0) +
                        primarySchedule.dayOfWeek.slice(1).toLowerCase()}
                      s: {primarySchedule.startTime}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeMessagesSection({
  messages,
}: {
  messages: MessageListItem[];
}) {
  const featuredMessages = messages.slice(0, 3);
  const currentSeriesName =
    featuredMessages[0]?.seriesName || "Hope for Tomorrow";

  return (
    <section className="bg-white py-20 border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-2.5 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Current Series
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {currentSeriesName}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Get caught up with our recent sermon series and grow in the grace
            and knowledge of our Lord Jesus Christ.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {featuredMessages.map((msg) => (
            <article key={msg.id} className="group flex flex-col">
              <Link
                href={`/messages/${msg.slug}`}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-slate-100"
              >
                <Image
                  src={msg.thumbnailUrl}
                  alt={msg.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="pt-4 flex-1 flex flex-col">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#EA580C]">
                  {(msg.seriesName || "SERMON SERIES").toUpperCase()} | PAST
                  MESSAGES
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-[#EA580C] transition-colors">
                  <Link href={`/messages/${msg.slug}`}>{msg.title}</Link>
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Posted on {formatDate(msg.datePreached)} &middot;{" "}
                  {msg.speaker}
                </p>
                <div className="mt-4 pt-1">
                  <Link
                    href={`/messages/${msg.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#EA580C] transition-colors"
                  >
                    <span>Listen to the Message</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeAboutVisionSection({
  settings,
}: {
  settings: ChurchSettingsData;
}) {
  return (
    <section className="bg-[#0B1325] text-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-white/10">
            <Image
              src="/assets/church/community-fellowship.jpg"
              alt="Agape Communion Church fellowship"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F97316]">
                Who We Are
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                A Christ-Centered Family in the Heart of Nigeria
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {settings.aboutBackground}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="rounded-sm border border-white/10 bg-white/5 p-5 space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F97316]">
                  Our Vision
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {settings.vision}
                </p>
              </div>
              <div className="rounded-sm border border-white/10 bg-white/5 p-5 space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F97316]">
                  Our Mission
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {settings.mission}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white hover:text-[#F97316] transition-colors"
              >
                <span>Read Our Full Story & Beliefs</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeUpcomingEventsSection({
  events,
}: {
  events: EventListItem[];
}) {
  const displayEvents = events.slice(0, 3);

  return (
    <section className="bg-white py-20 border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
              Church Calendar
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Upcoming Events & Gatherings
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#EA580C]"
          >
            <span>View All Events</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {displayEvents.map((event) => (
            <article
              key={event.id}
              className="flex flex-col rounded-sm border border-slate-200 bg-white overflow-hidden"
            >
              <Link
                href={`/events/${event.slug}`}
                className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden"
              >
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </Link>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#EA580C]">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <time dateTime={new Date(event.startDate).toISOString()}>
                    {formatDate(event.startDate, "MMM d, yyyy 'at' h:mm a")}
                  </time>
                </div>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  <Link
                    href={`/events/${event.slug}`}
                    className="hover:text-[#EA580C] transition-colors"
                  >
                    {event.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2 flex-1">
                  {event.excerpt}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[200px]">{event.venue}</span>
                  <Link
                    href={`/events/${event.slug}`}
                    className="font-semibold text-slate-900 hover:text-[#EA580C]"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeDevotionalsAndBlogSection({
  devotionals,
  posts,
}: {
  devotionals: DevotionalListItem[];
  posts: BlogPostListItem[];
}) {
  return (
    <section className="bg-[#FAFAFA] py-20 border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
                Daily Walk
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Latest Devotionals
              </h2>
            </div>
            <Link
              href="/devotionals"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#EA580C]"
            >
              <span>Browse Devotionals</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {devotionals.slice(0, 3).map((devotional) => (
              <article
                key={devotional.id}
                className="rounded-sm border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-[#EA580C]">
                      {devotional.scriptureReference}
                    </span>
                    <time
                      dateTime={new Date(devotional.publishedAt).toISOString()}
                    >
                      {formatDate(devotional.publishedAt, "MMM d, yyyy")}
                    </time>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    <Link
                      href={`/devotionals/${devotional.slug}`}
                      className="hover:text-[#EA580C] transition-colors"
                    >
                      {devotional.title}
                    </Link>
                  </h3>
                  <p className="text-xs italic text-slate-600 line-clamp-3 border-l-2 border-[#EA580C] pl-3">
                    &ldquo;{devotional.biblePassage}&rdquo;
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/devotionals/${devotional.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#EA580C]"
                  >
                    <span>Read Devotional</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
                Articles & Reflections
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                From the Church Blog
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#EA580C]"
            >
              <span>Read All Articles</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
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
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#EA580C]">
                    {post.categoryName || "Church Life"}
                  </p>
                  <h3 className="mt-1.5 text-lg font-bold text-slate-900">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-[#EA580C] transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 text-xs text-slate-500">
                    By {post.authorName} &middot;{" "}
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeTestimoniesSection({
  testimonies,
}: {
  testimonies: PublicTestimonyCard[];
}) {
  return (
    <section className="bg-white py-20 border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-2.5 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
            Stories of Grace
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Testimonies From Our Congregation
          </h2>
          <p className="text-sm text-slate-600">
            Rejoicing together in how God is answering prayers and transforming
            lives across our church family.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonies.slice(0, 3).map((item) => (
            <article
              key={item.id}
              className="rounded-sm border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.publicName}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {item.publicName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.roleOrRelation || "Congregation Member"}
                    </p>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  &ldquo;{item.excerpt}&rdquo;
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{formatDate(item.publishedAt)}</span>
                <Link
                  href="/testimonies"
                  className="font-semibold text-[#EA580C] hover:underline"
                >
                  Read Full Story
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeContactBannerSection({
  settings,
}: {
  settings: ChurchSettingsData;
}) {
  return (
    <section className="bg-[#FAFAFA] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-slate-200 bg-white p-8 sm:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
                Worship With Us
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Plan Your Visit to {settings.churchName}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {settings.serviceSummary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-[#EA580C] shrink-0" />
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-[#EA580C] shrink-0" />
                  <span>{settings.livestreamDefaultSchedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-[#EA580C] shrink-0" />
                  <span>{settings.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-[#EA580C] shrink-0" />
                  <span>{settings.email}</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-4">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-sm bg-[#EA580C] px-7 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#D94E07]"
              >
                Contact Our Team
              </Link>
              <Link
                href="/services"
                className="inline-flex h-11 items-center justify-center rounded-sm border border-slate-300 bg-white px-6 text-xs font-semibold uppercase tracking-wider text-slate-800 hover:bg-slate-50"
              >
                Service Times
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

