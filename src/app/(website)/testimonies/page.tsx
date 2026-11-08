import Image from "next/image";
import { PageHeader } from "@/components/website/page-header";
import { TestimonySubmissionForm } from "@/components/website/testimony-submission-form";
import { getAllPublishedTestimonies } from "@/features/testimonies/queries";
import { formatDate } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Testimonies of God's Grace",
  description:
    "Read real testimonies of answered prayer, healing, and transformation from members of Agape Communion Church in Nigeria.",
  path: "/testimonies",
});

export default async function TestimoniesPage() {
  const testimonies = await getAllPublishedTestimonies();

  return (
    <div>
      <PageHeader
        kicker="Praise Reports"
        title="Testimonies of God's Faithfulness"
        subtitle="We give glory to God for answered prayers, restored families, and transformed lives across our church community."
        backgroundImage="/assets/testimonies/deacon-chinedu-obi.jpg"
      />

      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonies.map((item) => (
              <article
                key={item.id}
                className="rounded-sm border border-slate-200 bg-white overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[16/10] w-full bg-slate-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.publicName}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                        {item.publicName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.roleOrRelation || "Congregation Member"} &middot;{" "}
                        {formatDate(item.publishedAt)}
                      </p>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h2>
                    <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-sm border-l-2 border-[#EA580C]">
                      {item.excerpt}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.fullTestimony}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#FAFAFA]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <TestimonySubmissionForm />
        </div>
      </section>
    </div>
  );
}

