import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Github, ArrowRight, CheckCircle2, Cpu, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { meta } from "@/components/nexora/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeUp } from "@/components/layout/FadeUp";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) =>
    meta(
      loaderData?.title ?? "Project unavailable",
      loaderData?.summary ?? "Explore student projects by Nexora.",
    ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const project = Route.useLoaderData();
  const [active, setActive] = useState(0);

  // Map project category to request service parameter
  const requestServiceId =
    project.category === "Front-End"
      ? "software"
      : project.category === "Hardware"
      ? "embedded"
      : "embedded";

  const galleryImages =
    project.gallery && project.gallery.length > 0
      ? project.gallery
      : [project.image ?? `/images/project-${((Number(project.id) - 1) % 6) + 1}.webp`];

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Banner / PageHeader */}
      <PageHeader
        title={project.title}
        breadcrumb={[
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
      />

      <main className="container py-10 md:py-16">
        {/* Back Link */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            className="text-royal dark:text-glow hover:bg-royal/10 -ml-3 px-3 h-9 text-sm font-semibold rounded-lg"
          >
            <Link to="/projects">
              <ArrowLeft className="size-4 mr-2" />
              <span>Back to all projects</span>
            </Link>
          </Button>
        </div>

        <FadeUp>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Main Image & Gallery Selector */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card shadow-xl aspect-[16/10] w-full">
                <img
                  src={galleryImages[active]}
                  alt={`${project.title} — visual preview ${active + 1}`}
                  width={1536}
                  height={1024}
                  className="size-full object-cover object-center transition-all duration-300"
                />
                {/* Category Pill Overlay */}
                <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-xl bg-navy/85 backdrop-blur-md px-3.5 py-1.5 text-white border border-white/20 text-xs font-semibold shadow-md">
                  <span>{project.category}</span>
                </div>
              </div>

              {/* Gallery Thumbnails (if multiple images) */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((img, i) => (
                    <button
                      key={`${img}-${i}`}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Switch to gallery image ${i + 1}`}
                      className={`relative size-20 sm:size-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        active === i
                          ? "border-royal ring-2 ring-royal/30 scale-105"
                          : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        width={200}
                        height={150}
                        className="size-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* External Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {project.demoUrl && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-border hover:bg-accent rounded-xl text-xs font-semibold h-10 px-4"
                  >
                    <a href={project.demoUrl} target="_blank" rel="noreferrer">
                      <span>Live Prototype Demo</span>
                      <ExternalLink className="size-3.5 ml-2" />
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-border hover:bg-accent rounded-xl text-xs font-semibold h-10 px-4"
                  >
                    <a href={project.githubUrl} target="_blank" rel="noreferrer">
                      <Github className="size-3.5 mr-2" />
                      <span>Code Repository</span>
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column: Overview, Tech Stack, Results, CTA */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {/* Project Title & Category */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
                  <span>{project.category}</span>
                </div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
                  {project.title}
                </h1>
              </div>

              {/* Project Overview */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-royal dark:text-glow mb-2">
                  <Wrench className="size-3.5" />
                  <span>PROJECT OVERVIEW</span>
                </div>
                <h2 className="font-heading font-bold text-lg text-foreground mb-3">
                  The Idea Behind the Build
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.summary}
                </p>
              </div>

              {/* Tech Stack Chips */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-royal dark:text-glow mb-3">
                  <Cpu className="size-3.5" />
                  <span>TECHNOLOGIES USED</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full bg-royal/10 dark:bg-royal/20 border border-royal/20 px-3 py-1 text-royal dark:text-glow text-xs font-semibold shadow-2xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Results & Key Deliverables */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="text-xs font-bold font-display uppercase tracking-wider text-royal dark:text-glow mb-3">
                  RESULTS & DELIVERABLES
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>Working, bench-tested hardware/firmware prototype validated.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>Full circuit schematic, pinout diagram, and production bill of materials.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>Clean modular codebase with setup documentation and demo instructions.</span>
                  </li>
                </ul>
              </div>

              {/* "Request something similar" Action Card */}
              <div className="rounded-2xl bg-brand-gradient p-6 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-bold text-lg leading-snug">
                    Have a similar project in mind?
                  </h3>
                  <p className="text-xs text-white/85 mt-1">
                    Get paired with our student engineers to build your custom prototype.
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-navy font-semibold hover:bg-white/90 shadow-md transition-all h-11 px-5 rounded-xl text-xs shrink-0 cursor-pointer"
                >
                  <Link to="/request" search={{ service: requestServiceId }}>
                    <span>Request this service</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeUp>
      </main>
    </div>
  );
}
