import { CountUp } from "@/components/layout/CountUp";
import { FadeUp } from "@/components/layout/FadeUp";
import { projects } from "@/data/projects";
import { services, howItWorks } from "@/data/site";
import { Layers, Workflow, Wrench, ShieldCheck } from "lucide-react";

export function StatsBand() {
  const statsList = [
    {
      value: projects.length,
      isNumeric: true,
      suffix: "+",
      label: "Completed Projects",
      subtext: "Hardware & software prototypes",
      icon: Layers,
    },
    {
      value: services.length,
      isNumeric: true,
      suffix: "",
      label: "Core Service Areas",
      subtext: "Embedded, VLSI, software & academia",
      icon: Wrench,
    },
    {
      value: howItWorks.length,
      isNumeric: true,
      suffix: "",
      label: "Steps in Our Process",
      subtext: "Transparent concept-to-delivery flow",
      icon: Workflow,
    },
    {
      textValue: "Full",
      isNumeric: false,
      label: "Support after delivery",
      subtext: "Code, schematics & walkthrough",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="bg-navy text-white py-12 sm:py-16 border-y border-white/10 relative overflow-hidden">
      {/* Subtle ambient background glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-gradient opacity-10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-glow opacity-5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {statsList.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <FadeUp key={stat.label} delay={index * 0.08} className="h-full">
                <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl transition-transform duration-200 hover:-translate-y-1">
                  {/* Subtle Icon Accent */}
                  <div className="size-10 sm:size-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-glow mb-3.5 backdrop-blur-xs">
                    <Icon className="size-5" />
                  </div>

                  {/* Counter / Stat Value */}
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-none">
                    {stat.isNumeric && typeof stat.value === "number" ? (
                      <CountUp value={stat.value} suffix={stat.suffix} />
                    ) : (
                      <span className="text-glow">{stat.textValue}</span>
                    )}
                  </div>

                  {/* Stat Label */}
                  <div className="mt-2 text-xs sm:text-sm font-semibold text-white/95 tracking-wide">
                    {stat.label}
                  </div>

                  {/* Real Subtext */}
                  <div className="mt-1 text-[11px] sm:text-xs text-white/60 max-w-[180px] leading-snug">
                    {stat.subtext}
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
