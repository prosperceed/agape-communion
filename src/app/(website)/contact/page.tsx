import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/website/page-header";
import { ContactForm } from "@/components/website/contact-form";
import { getPublicChurchSettings } from "@/features/pages/queries";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Contact Us & Plan a Visit",
  description:
    "Get in touch with Agape Communion Church in Lekki, Lagos. Find our address, service times, phone number, email, and contact form.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getPublicChurchSettings();

  return (
    <div>
      <PageHeader
        kicker="Connect With Us"
        title="Contact Our Church Office"
        subtitle="We would love to hear from you, pray with you, and welcome you in person at our sanctuary in Lagos."
        backgroundImage="/assets/church/community-fellowship.jpg"
      />

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
                  Sanctuary & Office
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {settings.churchName}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {settings.serviceSummary}
                </p>
              </div>

              <div className="space-y-4 rounded-sm border border-slate-200 bg-[#FAFAFA] p-6 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Address</p>
                    <p>{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Phone</p>
                    <p>{settings.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p>{settings.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      Regular Service Times
                    </p>
                    <p>{settings.livestreamDefaultSchedule}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-slate-200 bg-white p-6 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Location & Social Media
                </h3>
                <div className="flex flex-wrap gap-3 text-xs font-semibold">
                  <a
                    href={settings.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-sm bg-[#0B1325] px-4 py-2 text-white hover:bg-[#152238]"
                  >
                    <span>Open in Google Maps</span>
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </a>
                  {settings.youtubeUrl && (
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-sm border border-slate-300 px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      YouTube
                    </a>
                  )}
                  {settings.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-sm border border-slate-300 px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Facebook
                    </a>
                  )}
                  {settings.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-sm border border-slate-300 px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

