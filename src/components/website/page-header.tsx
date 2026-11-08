import Image from "next/image";

interface PageHeaderProps {
  kicker: string;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  backgroundImage = "/assets/hero/worship-sanctuary.jpg",
}: PageHeaderProps) {
  return (
    <section className="relative bg-[#0B1325] text-white py-16 sm:py-24 overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[#0B1325]/75" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F97316]">
            {kicker}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

