import { Cpu, Receipt, GraduationCap, FileCheck2 } from "lucide-react";
import { FadeUp } from "@/components/layout/FadeUp";

export function WhyNexoraSection() {
  const tiles = [
    {
      title: "Hands-on hardware prototyping",
      description:
        "We assemble physical circuit breadboards, solder custom test modules, and verify electronic signals in our lab—never stopping at mere theoretical simulations.",
      icon: Cpu,
    },
    {
      title: "Clear quote before we start",
      description:
        "Transparent milestone breakdowns, comprehensive component bill-of-materials, and fixed pricing so you know exactly what to expect from day one.",
      icon: Receipt,
    },
    {
      title: "Step-by-step guidance",
      description:
        "Personalized one-on-one engineering mentorship, regular progress check-ins, and direct access to your builder to answer any technical questions.",
      icon: GraduationCap,
    },
    {
      title: "Documentation and demo included",
      description:
        "Complete source code, schematic diagrams, setup instructions, and an interactive live walkthrough demonstration before final handover.",
      icon: FileCheck2,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background text-foreground overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
            <span>WHY NEXORA</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
            Built for Real-World Success
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            We provide the hands-on engineering rigor, transparent milestones, and technical
            mentorship needed to take your embedded idea from paper to a fully functioning
            prototype.
          </p>
        </div>

        {/* 4 Tiles Grid with Hover Lift & Icon Circles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiles.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <FadeUp key={tile.title} delay={index * 0.08} className="h-full">
                <div className="group relative flex flex-col justify-between h-full p-6 sm:p-7 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div>
                    {/* Icon Circle */}
                    <div className="inline-flex size-13 sm:size-14 items-center justify-center rounded-2xl bg-royal/10 dark:bg-royal/20 text-royal dark:text-glow group-hover:bg-brand-gradient group-hover:text-white transition-all duration-300 shadow-sm mb-5">
                      <Icon className="size-6 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground tracking-tight group-hover:text-royal dark:group-hover:text-glow transition-colors duration-200">
                      {tile.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {tile.description}
                    </p>
                  </div>

                  {/* Subtle accent line on hover */}
                  <div className="mt-6 pt-3 border-t border-border/50 group-hover:border-royal/30 dark:group-hover:border-glow/30 transition-colors duration-200 flex items-center gap-1.5 text-[11px] font-semibold text-royal dark:text-glow">
                    <span>Guaranteed standard</span>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
