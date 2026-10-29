import { createFileRoute, Link } from "@tanstack/react-router";
import { Cpu, CircuitBoard, Code2, GraduationCap, ArrowRight, Check } from "lucide-react";
import { services, howItWorks } from "@/data/site";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeUp } from "@/components/layout/FadeUp";
import { meta } from "@/components/nexora/shared";

const iconMap = {
  embedded: Cpu,
  hardware: CircuitBoard,
  frontend: Code2,
  advice: GraduationCap,
} as const;

export const Route = createFileRoute("/services")({
  head: () =>
    meta(
      "Our Services",
      "Explore Nexora's core engineering domains: Embedded & IoT systems, VLSI design, software builds, and academic solutions.",
    ),
  component: Services,
});

function Services() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        title="Our Services"
        breadcrumb={[{ label: "Services" }]}
      />

      <main className="container py-12 md:py-16">
        {/* Intro Section */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
            <span>ENGINEERING DISCIPLINES</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
            Specialized Engineering for Student Builders & Innovators
          </h1>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            From circuit schematics and firmware coding to cloud backends and final academic project reports, 
            explore our four engineering disciplines tailored to turn ambitious concepts into working reality.
          </p>
        </div>

        {/* 4 Large Alternating Image/Text Rows */}
        <div className="space-y-16 md:space-y-24 mb-20 md:mb-28">
          {services.map((service, index) => {
            const isEven = index % 2 === 0;
            const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Cpu;
            const formattedIndex = String(index + 1).padStart(2, "0");

            return (
              <FadeUp key={service.id} delay={0.1}>
                <section
                  aria-labelledby={`service-${service.id}-heading`}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center rounded-3xl p-6 sm:p-8 md:p-10 bg-card border border-border shadow-xs hover:shadow-md transition-shadow duration-300"
                >
                  {/* Image Column */}
                  <div
                    className={`lg:col-span-6 relative w-full ${
                      isEven ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    {/* Subtle ambient gradient glow */}
                    <div
                      className="absolute -inset-4 rounded-3xl bg-brand-gradient opacity-15 blur-2xl -z-10 pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Image card container */}
                    <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card shadow-lg aspect-[16/10]">
                      <img
                        src={service.image}
                        alt={service.name}
                        width={1536}
                        height={1024}
                        loading="lazy"
                        className="size-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/images/service-embedded.webp";
                        }}
                      />
                      {/* Floating Service Icon Pill */}
                      <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-xl bg-navy/85 backdrop-blur-md px-3.5 py-2 text-white border border-white/20 text-xs font-semibold shadow-md">
                        <Icon className="size-4 text-glow" />
                        <span>Domain {formattedIndex}</span>
                      </div>
                    </div>
                  </div>

                  {/* Text Column */}
                  <div
                    className={`lg:col-span-6 flex flex-col items-start ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    {/* Number & Category Pill */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
                      <span>SERVICE {formattedIndex}</span>
                    </div>

                    {/* Heading */}
                    <h2
                      id={`service-${service.id}-heading`}
                      className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight"
                    >
                      {service.name}
                    </h2>

                    {/* Short Tagline */}
                    <p className="text-base sm:text-lg font-medium text-royal dark:text-glow mt-2">
                      {service.short}
                    </p>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mt-4">
                      {service.description}
                    </p>

                    {/* Bullet Points */}
                    <div className="w-full my-6">
                      <div className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground mb-3">
                        Key Capabilities & Deliverables
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {service.tags.map((tag) => (
                          <li
                            key={tag}
                            className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground"
                          >
                            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-2xs">
                              <Check className="size-3 stroke-[3]" />
                            </div>
                            <span>{tag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* "Request this service" button */}
                    <Button
                      asChild
                      size="lg"
                      className="bg-brand-gradient text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all h-11 px-6 text-sm font-semibold rounded-xl cursor-pointer"
                    >
                      <Link to="/request" search={{ service: service.id }}>
                        <span>Request this service</span>
                        <ArrowRight className="size-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </section>
              </FadeUp>
            );
          })}
        </div>

        {/* Compact How It Works Strip */}
        <FadeUp delay={0.15}>
          <div className="rounded-2xl md:rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm relative overflow-hidden">
            {/* Background ambient decorative shapes */}
            <div
              className="absolute -top-16 -right-16 size-64 rounded-full bg-royal/10 dark:bg-royal/20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-16 -left-16 size-64 rounded-full bg-magenta/10 dark:bg-magenta/20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-2.5">
                    <span>TRANSPARENT PROCESS</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
                    How It Works
                  </h3>
                  <p className="mt-1.5 text-muted-foreground text-sm max-w-xl leading-relaxed">
                    A streamlined, predictable six-step methodology from initial inquiry to test-verified delivery.
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="self-start md:self-end border-border hover:bg-accent text-xs font-semibold h-9 px-4 rounded-lg"
                >
                  <Link to="/request">
                    <span>Start Your Project</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>

              {/* 6 Steps Compact Strip */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pt-8">
                {howItWorks.map((step) => {
                  const formattedNum = String(step.step).padStart(2, "0");
                  return (
                    <div key={step.step} className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white text-xs font-heading font-bold shadow-2xs">
                          {formattedNum}
                        </span>
                        <div className="h-[2px] flex-1 bg-border/60" aria-hidden="true" />
                      </div>
                      <h4 className="font-heading font-bold text-sm sm:text-base text-foreground tracking-tight">
                        {step.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </FadeUp>
      </main>
    </div>
  );
}
