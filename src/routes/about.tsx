import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Linkedin, Target, ShieldCheck, Users, Sparkles, ArrowRight } from "lucide-react";
import { team } from "@/data/site";
import { meta } from "@/components/nexora/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { InitialsAvatar } from "@/components/layout/InitialsAvatar";
import { FadeUp } from "@/components/layout/FadeUp";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () =>
    meta(
      "About Nexora",
      "Meet Nexora, a student engineering collective delivering embedded systems, IoT hardware prototypes, and hands-on project mentorship.",
    ),
  component: About,
});

const VALUES = [
  {
    icon: Target,
    title: "Hands-On Rigor",
    description:
      "No black boxes. Every circuit schematic, firmware interrupt, and pin mapping is rigorously verified on our workbench.",
  },
  {
    icon: Users,
    title: "Student-Led Mentorship",
    description:
      "We don't just build prototypes; we walk you through the architecture and code so you ace your demos and defense.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Collaboration",
    description:
      "Upfront fixed milestone quotes, regular video updates of breadboard progress, and direct chat communication.",
  },
  {
    icon: Sparkles,
    title: "End-to-End Excellence",
    description:
      "Seamless integration from bare-metal C/C++ firmware on ESP32 & ARM up to modern front-end dashboards.",
  },
];

function About() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        title="About Us"
        breadcrumb={[{ label: "About" }]}
      />

      <main className="container py-12 md:py-20">
        {/* Story Section */}
        <FadeUp>
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20 md:mb-28">
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-4">
                <span>OUR STORY</span>
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-tight mb-6">
                From Breadboard Experiments to Student Innovation
              </h1>
              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  Nexora started with a straightforward realization: engineering students often have groundbreaking concepts 
                  for IoT devices, assistive robotics, and digital logic systems, but get stuck between abstract classroom theory 
                  and the messy realities of hardware debugging.
                </p>
                <p>
                  We founded Nexora as a peer-driven engineering workshop where fellow students collaborate with experienced builders. 
                  Whether it is troubleshooting an I2C communication bus, writing bare-metal firmware for an ESP32, or synthesizing 
                  Verilog on an FPGA, we provide the workbench, the test equipment, and the dedicated guidance to bring ideas to life.
                </p>
              </div>
            </div>

            {/* Story Image */}
            <div className="lg:col-span-5 relative">
              <div
                className="absolute -inset-4 rounded-3xl bg-brand-gradient opacity-15 blur-2xl -z-10 pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card shadow-xl aspect-[4/5] max-h-[500px] w-full">
                <img
                  src="/images/about.webp"
                  alt="Nexora engineering laboratory workbench and prototyping equipment"
                  width={1122}
                  height={1402}
                  loading="lazy"
                  className="size-full object-cover object-center"
                />
              </div>
            </div>
          </section>
        </FadeUp>

        {/* Mission Section */}
        <FadeUp delay={0.1}>
          <section className="rounded-3xl bg-brand-gradient p-8 sm:p-12 md:p-16 text-white shadow-xl mb-20 md:mb-28 relative overflow-hidden">
            <div
              className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-white text-xs font-bold font-display uppercase tracking-widest mb-4 backdrop-blur-xs">
                <span>OUR MISSION</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight mb-5">
                Democratizing Advanced Embedded & Hardware Engineering for Every Builder
              </h2>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8">
                Our mission is to bridge the gap between classroom theory and real-world technology. We empower builders 
                with hands-on hardware testing, clean production-ready code, and one-on-one technical mentorship.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-navy font-semibold hover:bg-white/90 shadow-md transition-all h-11 px-7 rounded-xl text-sm cursor-pointer"
              >
                <Link to="/request">
                  <span>Start Your Project</span>
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        </FadeUp>

        {/* Values Section */}
        <FadeUp delay={0.15}>
          <section className="mb-20 md:mb-28">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
                <span>CORE VALUES</span>
              </div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
                The Principles That Guide Every Prototype
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
                We measure our success by the technical clarity and confidence our partners gain throughout the development process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.title}
                    className="p-6 rounded-2xl md:rounded-3xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="size-12 rounded-xl bg-brand-gradient text-white flex items-center justify-center mb-5 shadow-2xs">
                        <Icon className="size-6" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                        {val.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {val.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </FadeUp>

        {/* Team Section (Render only if team exists in src/data) */}
        {team && team.length > 0 && (
          <FadeUp delay={0.2}>
            <section className="mt-16 md:mt-24">
              <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
                  <span>THE BUILDERS</span>
                </div>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
                  Meet the Engineering Leads
                </h2>
                <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Three passionate student developers with a shared obsession for hardware, firmware, and modern web applications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {team.map((member) => (
                  <article
                    key={member.name}
                    className="flex flex-col items-center text-center p-8 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                  >
                    <div className="mb-6 flex justify-center">
                      <InitialsAvatar
                        name={member.name}
                        photo={member.photo}
                        size="lg"
                      />
                    </div>
                    <div className="w-full flex flex-col items-center">
                      <h3 className="font-heading font-bold text-xl text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-sm text-royal dark:text-glow font-medium my-2">
                        {member.role}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 my-4">
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full px-3 py-1 bg-royal/10 text-royal dark:bg-royal/20 dark:text-glow text-xs font-medium border border-royal/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-center gap-4 mt-2">
                        <a
                          aria-label={`${member.name} GitHub`}
                          href="https://github.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors p-2"
                        >
                          <Github size={18} />
                        </a>
                        <a
                          aria-label={`${member.name} LinkedIn`}
                          href="https://linkedin.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors p-2"
                        >
                          <Linkedin size={18} />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </FadeUp>
        )}
      </main>
    </div>
  );
}
