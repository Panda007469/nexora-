import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";
import { meta } from "@/components/nexora/shared";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/layout/FadeUp";
import { HeroSlider } from "@/components/home/HeroSlider";
import { AboutSection } from "@/components/home/AboutSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { StatsBand } from "@/components/home/StatsBand";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhyNexoraSection } from "@/components/home/WhyNexoraSection";
import { HomeCtaBand } from "@/components/home/HomeCtaBand";
import { FaqPreviewSection } from "@/components/home/FaqPreviewSection";

export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "From Your Idea to a Working Embedded Prototype",
      "Nexora delivers embedded systems, IoT hardware, and custom software builds for students, startups, and businesses with hands-on guidance.",
    ),
  component: Home,
});

function Home() {
  return (
    <>
      {/* 1. Hero */}
      <FadeUp>
        <HeroSlider />
      </FadeUp>

      {/* Slim Project Tracking Banner */}
      <section className="bg-background border-b border-border/60 py-5 sm:py-6">
        <div className="container">
          <div className="rounded-2xl border border-border bg-card px-5 py-4 sm:px-6 sm:py-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="size-10 rounded-xl bg-royal/10 dark:bg-royal/20 text-royal dark:text-glow flex items-center justify-center shrink-0">
                <Search className="size-5" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base sm:text-lg text-foreground leading-snug">
                  Already sent a project request?
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Check its status anytime with your request code and email.
                </p>
              </div>
            </div>

            <Button
              asChild
              className="self-start sm:self-auto shrink-0 rounded-xl bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity h-10 px-5 text-xs sm:text-sm"
            >
              <Link to="/track">
                <span>Track your project</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. About */}
      <FadeUp>
        <AboutSection />
      </FadeUp>

      {/* 3. Services */}
      <FadeUp>
        <ServicesSection />
      </FadeUp>

      {/* 4. Stats band */}
      <FadeUp>
        <StatsBand />
      </FadeUp>

      {/* 5. Projects */}
      <FadeUp>
        <ProjectsSection />
      </FadeUp>

      {/* 6. How It Works */}
      <FadeUp>
        <HowItWorksSection />
      </FadeUp>

      {/* 7. Why Nexora */}
      <FadeUp>
        <WhyNexoraSection />
      </FadeUp>

      {/* 8. CTA band */}
      <FadeUp>
        <HomeCtaBand />
      </FadeUp>

      {/* 9. FAQ preview */}
      <FadeUp>
        <FaqPreviewSection />
      </FadeUp>
    </>
  );
}
