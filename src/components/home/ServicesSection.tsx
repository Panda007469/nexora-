import { Link } from "@tanstack/react-router";
import { Cpu, CircuitBoard, Code2, GraduationCap, ArrowRight } from "lucide-react";
import { services } from "@/data/site";
import { Button } from "@/components/ui/button";

const iconMap = {
  embedded: Cpu,
  hardware: CircuitBoard,
  frontend: Code2,
  advice: GraduationCap,
} as const;

export function ServicesSection() {
  return (
    <section className="bg-navy py-16 md:py-24 text-white relative overflow-hidden">
      {/* Decorative ambient background accents */}
      <div
        className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-gradient opacity-10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-10 translate-y-1/2 w-80 h-80 rounded-full bg-royal opacity-10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container relative z-10">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
              <span>Our Capabilities</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
              What We Build
            </h2>
            <p className="mt-3 max-w-2xl text-white/70 text-sm sm:text-base leading-relaxed">
              Explore our four core engineering service domains, designed to guide student concepts
              from initial breadboard prototypes to finished, test-ready hardware.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="self-start md:self-end border-white/20 text-white bg-white/5 hover:bg-white hover:text-navy transition-colors duration-200 h-10 px-5 text-xs font-semibold rounded-lg"
          >
            <Link to="/services">
              <span>All Services</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* 4 Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Cpu;
            return (
              <Link
                key={service.id}
                to="/services"
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#031E44]/90 border border-white/10 p-5 text-white transition-all duration-200 ease-in-out hover:bg-white hover:shadow-2xl hover:-translate-y-1 hover:border-transparent cursor-pointer"
              >
                <div>
                  {/* Service Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-navy-light mb-4">
                    <img
                      src={service.image}
                      alt={service.name}
                      width={1536}
                      height={1024}
                      loading="lazy"
                      className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/images/service-embedded.webp";
                      }}
                    />
                  </div>

                  {/* Icon Circle (becomes bg-brand-gradient on hover with 200ms transition) */}
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-white/10 text-white border border-white/15 shadow-sm transition-all duration-200 ease-in-out group-hover:bg-brand-gradient group-hover:border-transparent group-hover:text-white group-hover:scale-105">
                    <Icon className="size-6 transition-transform duration-200" />
                  </div>

                  {/* Title (turns dark on hover) */}
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-white transition-colors duration-200 ease-in-out group-hover:text-[#001B3D] leading-snug">
                    {service.name}
                  </h3>

                  {/* Short text (turns dark muted on hover) */}
                  <p className="mt-2 text-sm text-white/70 transition-colors duration-200 ease-in-out group-hover:text-slate-600 leading-relaxed line-clamp-3">
                    {service.short}
                  </p>
                </div>

                {/* Bottom link prompt */}
                <div className="mt-6 pt-4 border-t border-white/10 transition-colors duration-200 ease-in-out group-hover:border-slate-200 flex items-center justify-between text-xs font-semibold text-glow transition-colors duration-200 ease-in-out group-hover:text-royal">
                  <span>Explore service</span>
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

