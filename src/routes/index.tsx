import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/components/nexora/shared";
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
      "Nexora delivers embedded systems, IoT hardware, and custom software builds with student-led innovation and hands-on guidance.",
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
