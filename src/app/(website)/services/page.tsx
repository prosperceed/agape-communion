import Image from "next/image";
import Link from "next/link";
import {
  ClockIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/website/page-header";
import { getPublishedServices } from "@/features/services/queries";
import { formatDate } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Our Services & Programmes",
  description:
    "View weekly worship schedules, midweek Bible study times, youth and children ministries, and special programmes at Agape Communion Church.",
  path: "/services",
});

export default async function ServicesPage() {
  const allServices = await getPublishedServices();
  const recurringServices = allServices.filter((s) => s.isRecurring);
  const datedProgrammes = allServices.filter((s) => !s.isRecurring);

  return (
    <div>
      <PageHeader
        kicker="Gather With Us"
        title="Our Services & Programmes"
        subtitle="We gather throughout the week for congregational worship, expositional Bible study, prayer, and age-focused discipleship."
        backgroundImage="/assets/services/sunday-communion-service.jpg"
      />

      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2 mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
              <ArrowPathIcon className="h-4 w-4" />
              <span>Recurring Weekly Schedule</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Regular Weekly Activities
            </h2>
            <p className="text-sm text-slate-600">
              Consistent weekly fellowships designed to nourish your faith and
              connect you with other believers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recurringServices.map((service) => (
              <article
                key={service.id}
                className="rounded-sm border border-slate-200 bg-white overflow-hidden flex flex-col"
              >
                {service.imageUrl && (
                  <div className="relative aspect-[16/10] w-full bg-slate-100">
                    <Image
                      src={service.imageUrl}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-sm bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#EA580C]">
                        Recurring Activity
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700">
                    {service.schedules.map((sch) => (
                      <div key={sch.id} className="flex items-start gap-2">
                        <ClockIcon className="h-4 w-4 text-[#EA580C] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">
                            {sch.dayOfWeek.charAt(0) +
                              sch.dayOfWeek.slice(1).toLowerCase()}
                          </span>
                          : {sch.startTime} to {sch.endTime}
                          {sch.notes ? ` (${sch.notes})` : ""}
                        </div>
                      </div>
                    ))}
                    {service.location && (
                      <div className="flex items-start gap-2 text-slate-500">
                        <MapPinIcon className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{service.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {datedProgrammes.length > 0 && (
        <section className="py-20 bg-[#FAFAFA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2 mb-12">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
                <CalendarDaysIcon className="h-4 w-4" />
                <span>Special Dated Services</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Scheduled Special Programmes
              </h2>
              <p className="text-sm text-slate-600">
                Special covenant services and seasonal gatherings with specific
                dates.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {datedProgrammes.map((prog) => (
                <article
                  key={prog.id}
                  className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start"
                >
                  {prog.imageUrl && (
                    <div className="relative h-36 w-full sm:w-44 shrink-0 overflow-hidden rounded-sm bg-slate-100">
                      <Image
                        src={prog.imageUrl}
                        alt={prog.title}
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2.5 flex-1">
                    <span className="inline-flex items-center rounded-sm bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-800">
                      Dated Programme &middot;{" "}
                      {formatDate(prog.eventDate, "MMMM d, yyyy")}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {prog.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {prog.description}
                    </p>
                    {prog.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                        <MapPinIcon className="h-4 w-4 text-[#EA580C]" />
                        {prog.location}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#0B1325] text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">Joining Us for the First Time?</h2>
            <p className="text-sm text-slate-300">
              Our hospitality team would love to welcome you and help you find
              your seat.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-sm bg-[#EA580C] px-6 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#D94E07]"
          >
            Let Us Know You&apos;re Coming
          </Link>
        </div>
      </section>
    </div>
  );
}

