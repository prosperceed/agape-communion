import Image from "next/image";
import Link from "next/link";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/website/page-header";
import { getPublicChurchSettings } from "@/features/pages/queries";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About Our Church",
  description:
    "Learn about Agape Communion Church's background, vision, mission, biblical beliefs, and pastoral leadership in Lagos, Nigeria.",
  path: "/about",
});

export default async function AboutPage() {
  const settings = await getPublicChurchSettings();

  return (
    <div>
      <PageHeader
        kicker="Our Identity & Calling"
        title={`About ${settings.churchName}`}
        subtitle={settings.aboutIntro}
        backgroundImage="/assets/church/congregation-worship.jpg"
      />

      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
                Our Story & Background
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Rooted in Scripture, United in Christian Communion
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {settings.aboutBackground}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="rounded-sm border border-slate-200 bg-[#FAFAFA] p-6 space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#EA580C]">
                    Our Vision
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {settings.vision}
                  </p>
                </div>
                <div className="rounded-sm border border-slate-200 bg-[#FAFAFA] p-6 space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#EA580C]">
                    Our Mission
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {settings.mission}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-slate-100">
                <Image
                  src="/assets/church/sanctuary-intercession.jpg"
                  alt="Prayer at Agape Communion Church"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-slate-100 mt-8">
                <Image
                  src="/assets/church/community-fellowship.jpg"
                  alt="Christian fellowship and unity"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#FAFAFA] border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-2.5 mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
              Statement of Faith
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              What We Believe
            </h2>
            <p className="text-sm text-slate-600">
              Our teaching and fellowship rest upon historic, Bible-believing
              Christian doctrine.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {settings.coreBeliefs.map((belief) => (
              <div
                key={belief.title}
                className="rounded-sm border border-slate-200 bg-white p-6 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {belief.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-sm bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-[#EA580C]">
                    <BookOpenIcon className="h-3.5 w-3.5" />
                    {belief.scripture}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {belief.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-2.5 mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
              Pastoral Team
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Our Church Leadership
            </h2>
            <p className="text-sm text-slate-600">
              Dedicated servants committed to prayer, the ministry of the Word,
              and caring for the flock.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {settings.leadership.map((leader) => (
              <article
                key={leader.name}
                className="rounded-sm border border-slate-200 bg-white overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100">
                  <Image
                    src={leader.imageUrl}
                    alt={leader.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 space-y-2 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#EA580C]">
                    {leader.role}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900">
                    {leader.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {leader.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center rounded-sm bg-[#EA580C] px-7 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#D94E07]"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

