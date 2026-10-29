import { createFileRoute } from "@tanstack/react-router";
import { CircuitBoard, Cpu, Code2, GraduationCap } from "lucide-react";
import { meta } from "@/components/nexora/shared";
import { HeroSlider } from "@/components/home/HeroSlider";
import { AboutSection } from "@/components/home/AboutSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { HomeCtaBand } from "@/components/home/HomeCtaBand";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
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
      <HeroSlider />
      <div className="trust-strip">
        <div className="container trust-inner">
          <span>
            <CircuitBoard /> Hardware prototyping & circuit design
          </span>
          <span>
            <Cpu /> Microcontrollers & IoT systems
          </span>
          <span>
            <Code2 /> Clean, modern front-end web apps
          </span>
          <span>
            <GraduationCap /> One-on-one student project guidance
          </span>
        </div>
      </div>
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <HomeCtaBand />
      <HowItWorksSection />
      <FaqPreviewSection />
    </>
  );
}
