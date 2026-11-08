import { PublicNavbar } from "@/components/navigation/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { getPublicChurchSettings } from "@/features/pages/queries";
import { buildChurchJsonLd } from "@/lib/seo";

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicChurchSettings();
  const churchJsonLd = buildChurchJsonLd({
    name: settings.churchName,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(churchJsonLd) }}
      />
      <PublicNavbar churchName={settings.churchName} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <PublicFooter settings={settings} />
    </div>
  );
}

