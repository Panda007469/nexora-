import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowDown, FolderSearch, LoaderCircle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects, categories } from "@/data/projects";
import { meta } from "@/components/nexora/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeUp } from "@/components/layout/FadeUp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/")({
  head: () =>
    meta(
      "Our Projects",
      "Explore twelve sample Nexora projects in hardware, embedded systems, IoT and front-end web development.",
    ),
  component: Projects,
});

function Projects() {
  const [category, setCategory] = useState<string>("All projects");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(6);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLimit((value) => value + 6);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [loading]);

  const filtered = projects.filter(
    (p) =>
      p.published !== false &&
      (category === "All projects" || p.category === category) &&
      `${p.title} ${p.tech.join(" ")} ${p.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        title="Our Projects"
        breadcrumb={[{ label: "Projects" }]}
      />

      <main className="container py-12 md:py-16">
        {/* Intro */}
        <div className="max-w-3xl mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
            <span>THE NEXORA WORKBENCH</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
            Built with Curiosity & Technical Rigor
          </h1>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Circuits, firmware, and thoughtful engineering. Explore our sample prototypes and find inspiration for your own project build.
          </p>
        </div>

        {/* Filter Chips & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
          {/* Category Chips */}
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Filter projects by category"
          >
            {categories.map((item) => {
              const isActive = category === item;
              return (
                <button
                  key={item}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    setLimit(6);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-2xs",
                    isActive
                      ? "bg-brand-gradient text-white shadow-md ring-2 ring-royal/30"
                      : "bg-card text-foreground border border-border hover:bg-accent hover:border-royal/30",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Search by title, tech..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(6);
              }}
              aria-label="Search projects by title, tech, or category"
              className="w-full h-10 rounded-full pl-9 pr-8 text-xs sm:text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-royal/40 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Result counter */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-6 font-medium">
          <span>
            Showing <strong className="text-foreground">{Math.min(filtered.length, limit)}</strong> of{" "}
            <strong className="text-foreground">{filtered.length}</strong> projects
          </span>
          {category !== "All projects" && (
            <span className="text-xs text-royal dark:text-glow">Filtered by: {category}</span>
          )}
        </div>

        {/* Grid of Cards with Hover Gradient Overlay */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.slice(0, limit).map((project, index) => {
            const imageSrc = project.image;

            return (
              <FadeUp key={project.id} delay={index * 0.05} className="h-full">
                <article className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-card border border-border shadow-lg aspect-[4/5] select-none h-full transition-shadow duration-300 hover:shadow-2xl">
                  {/* Background Image */}
                  <img
                    src={imageSrc}
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
                    <h2 className="font-heading font-bold text-lg sm:text-xl text-white tracking-tight leading-snug">
                      {project.title}
                    </h2>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.tech.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/10 text-white/80"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hover State: bg-brand-gradient overlay slides up from bottom */}
                  <div className="absolute inset-0 bg-brand-gradient/95 p-6 flex flex-col justify-between text-white transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0">
                    <div>
                      <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md mb-3">
                        {project.category}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/20 text-white"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
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
                          View Details
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
                </article>
              </FadeUp>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 px-4 bg-card border border-border rounded-3xl max-w-lg mx-auto shadow-sm my-8">
            <div className="size-16 mx-auto mb-4 rounded-2xl bg-royal/10 dark:bg-royal/20 flex items-center justify-center text-royal dark:text-glow">
              <FolderSearch className="size-8" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground">
              No projects match your search
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              We couldn't find any projects matching &quot;{query}&quot;. Try adjusting your keywords or category filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory("All projects");
              }}
              className="mt-6 rounded-xl border-border"
            >
              Reset filters
            </Button>
          </div>
        )}

        {/* Load More Button */}
        {filtered.length > limit && (
          <div className="flex justify-center mt-12 md:mt-16">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLoading(true)}
              disabled={loading}
              aria-busy={loading}
              className="rounded-xl border-border hover:bg-accent font-semibold px-8 h-12 shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin mr-2" />
                  Loading more projects...
                </>
              ) : (
                <>
                  <span>Load more projects</span>
                  <ArrowDown className="size-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
