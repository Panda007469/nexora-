import { Link } from "@tanstack/react-router";
import { Cpu, CircuitBoard, Check, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stats } from "@/data/site";
import { CountUp } from "@/components/layout/CountUp";

export function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-background text-foreground overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image with rotating badge & floating stat badge */}
          <div className="lg:col-span-5 relative mx-auto max-w-md lg:max-w-none w-full">
            {/* Ambient decorative glow */}
            <div
              className="absolute -inset-4 rounded-3xl bg-brand-gradient opacity-15 blur-2xl -z-10 pointer-events-none"
              aria-hidden="true"
            />

            {/* Main Rounded Image */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card shadow-xl">
              <img
                src="/images/about.webp"
                alt="Nexora engineering team prototyping embedded and VLSI solutions"
                width={1122}
                height={1402}
                loading="lazy"
                className="w-full h-auto max-h-[520px] object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>

            {/* Small round rotating text badge: "Embedded • VLSI • IoT" */}
            <div
              className="absolute -top-5 -right-3 sm:-top-7 sm:-right-6 z-20 flex size-24 sm:size-28 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-xl border border-border p-1"
              aria-label="Embedded • VLSI • IoT"
            >
              <svg
                viewBox="0 0 100 100"
                className="size-full motion-safe:animate-[spin_12s_linear_infinite]"
                aria-hidden="true"
              >
                <path
                  id="about-circle-path"
                  d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                  fill="none"
                />
                <text className="text-[10px] font-display font-bold uppercase tracking-[0.22em] fill-foreground">
                  <textPath href="#about-circle-path" startOffset="0%">
                    Embedded • VLSI • IoT •
                  </textPath>
                </text>
              </svg>
              {/* Center icon in rotating badge */}
              <div className="absolute inset-0 m-auto flex size-11 sm:size-12 items-center justify-center rounded-full bg-navy text-white shadow-md border border-white/20">
                <Cpu className="size-5 text-glow" />
              </div>
            </div>

            {/* Floating bg-brand-gradient stat badge using real stat from site.ts */}
            <div className="absolute -bottom-5 -left-2 sm:-left-6 rounded-2xl bg-brand-gradient p-4 sm:p-5 text-white shadow-xl flex items-center gap-3.5 sm:gap-4 z-20 border border-white/20">
              <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
                <CheckCircle2 className="size-6 text-white" />
              </div>
              <div>
                <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight leading-none">
                  <CountUp value={stats.projectCount} suffix="+" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/90 mt-1">
                  Completed Projects
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Caps label, Heading, Paragraph, 2 Feature rows, Checklist, Learn More button */}
          <div className="lg:col-span-7 flex flex-col items-start pt-6 lg:pt-0">
            {/* Caps label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-4">
              <span>About Nexora</span>
            </div>

            {/* Heading */}
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-[1.15] mb-5">
              We're Your Partner for{" "}
              <span className="text-brand-gradient">Embedded Innovation</span>
            </h2>

            {/* Short paragraph */}
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
              Nexora bridges the gap between academic theory and real-world hardware. From microcontroller
              firmware and custom PCB schematics to VLSI architecture, our student-led team provides
              hands-on guidance and engineering support to turn your vision into a test-ready prototype.
            </p>

            {/* Two icon feature rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-royal/10 text-royal dark:bg-royal/20 dark:text-glow">
                  <Cpu className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-foreground">
                    Hardware & Firmware
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                    Circuit schematics, sensors, and low-level C/C++ on ESP32 & ARM.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-violet dark:bg-violet/20 dark:text-glow">
                  <CircuitBoard className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-foreground">
                    VLSI & IoT Solutions
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                    Digital logic, telemetry, and end-to-end cloud integrations.
                  </p>
                </div>
              </div>
            </div>

            {/* 3-item checklist */}
            <ul className="space-y-2.5 mb-8 w-full">
              <li className="flex items-center gap-3 text-sm text-foreground">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-royal/10 dark:bg-royal/20 text-royal dark:text-glow">
                  <Check className="size-3.5" />
                </div>
                <span>One-on-one student engineering mentorship & code reviews</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-royal/10 dark:bg-royal/20 text-royal dark:text-glow">
                  <Check className="size-3.5" />
                </div>
                <span>Complete source code, wiring schematics & walkthrough guides</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-royal/10 dark:bg-royal/20 text-royal dark:text-glow">
                  <Check className="size-3.5" />
                </div>
                <span>Transparent milestone pricing with reliable project delivery</span>
              </li>
            </ul>

            {/* Learn more button */}
            <Button
              asChild
              className="bg-brand-gradient text-white hover:opacity-95 shadow-md shadow-royal/20 border-0 h-11 px-6 text-sm font-semibold rounded-lg transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <Link to="/about">
                <span>Learn more</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

