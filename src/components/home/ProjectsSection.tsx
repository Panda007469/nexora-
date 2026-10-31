import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/layout/FadeUp";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";

export function ProjectsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Take published projects for carousel
  const carouselProjects = projects
    .filter((project) => project.published !== false)
    .slice(0, 6)
    .map((project) => ({
      ...project,
      imageSrc: project.image,
    }));

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <section className="py-16 md:py-24 bg-background text-foreground overflow-hidden">
      <div className="container">
        {/* Header with Label, Heading, and View All / Carousel Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
              <span>FEATURED WORK</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
              Our Completed Projects
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base leading-relaxed">
              Explore recent hardware, embedded microcontroller systems, and software builds crafted by our student engineers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="h-10 px-5 text-xs font-semibold rounded-lg border-border hover:bg-accent"
            >
              <Link to="/projects">
                <span>All Projects</span>
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Carousel Component */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4 sm:-ml-6">
            {carouselProjects.map((project, index) => (
              <CarouselItem
                key={project.id}
                className="pl-4 sm:pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <FadeUp delay={index * 0.08} className="h-full">
                  {/* Tall Card */}
                  <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-card border border-border shadow-lg aspect-[4/5] select-none h-full">
                    {/* Background Image */}
                    <img
                      src={project.imageSrc}
                      alt={project.alt ?? project.title}
                      width={project.width ?? 1672}
                      height={project.height ?? 941}
                      loading="lazy"
                      className="size-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Base Gradient overlay so title & category are crisp */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#001B3D]/95 via-[#001B3D]/60 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
                      aria-hidden="true"
                    />

                    {/* Title & Category at the bottom (Default State) */}
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-4">
                      <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-md mb-2">
                        {project.category}
                      </span>
                      <h3 className="font-heading font-bold text-lg sm:text-xl text-white tracking-tight leading-snug">
                        {project.title}
                      </h3>
                    </div>

                    {/* Hover State: bg-brand-gradient overlay slides up from bottom */}
                    <div className="absolute inset-0 bg-brand-gradient/95 p-6 flex flex-col justify-between text-white transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0">
                      <div>
                        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                          {project.category}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight leading-snug mb-3">
                          {project.title}
                        </h3>
                        {project.summary && (
                          <p className="text-white/90 text-xs sm:text-sm line-clamp-3 mb-5 leading-relaxed">
                            {project.summary}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-white/20">
                          <Link
                            to="/projects/$slug"
                            params={{ slug: project.slug }}
                            className="text-xs font-semibold tracking-wider uppercase font-display text-white hover:underline underline-offset-4"
                          >
                            View Case Study
                          </Link>
                          {/* Round arrow button linking to project detail page */}
                          <Link
                            to="/projects/$slug"
                            params={{ slug: project.slug }}
                            aria-label={`View details for ${project.title}`}
                            className="flex size-12 items-center justify-center rounded-full bg-white text-navy shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                          >
                            <ArrowRight className="size-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          <div className="hidden sm:block">
            <CarouselPrevious className="-left-4 lg:-left-6 top-1/2 -translate-y-1/2 bg-background/90 text-foreground border-border shadow-md hover:bg-accent" />
            <CarouselNext className="-right-4 lg:-right-6 top-1/2 -translate-y-1/2 bg-background/90 text-foreground border-border shadow-md hover:bg-accent" />
          </div>
        </Carousel>

        {/* Carousel Dots Below */}
        {count > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300 cursor-pointer",
                  current === i
                    ? "w-8 bg-brand-gradient shadow-xs"
                    : "w-2.5 bg-border hover:bg-muted-foreground/40",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

