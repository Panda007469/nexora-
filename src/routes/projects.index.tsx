import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ArrowDown, FolderSearch, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects, categories } from "@/data/projects";
import { PageHeading, ProjectCard, meta } from "@/components/nexora/shared";
export const Route = createFileRoute("/projects/")({
  head: () =>
    meta(
      "Projects",
      "Explore twelve sample Nexora projects in hardware, embedded systems and front-end development.",
    ),
  component: Projects,
});
function Projects() {
  const [category, setCategory] = useState("All projects");
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
      (category === "All projects" || p.category === category) &&
      `${p.title} ${p.tech.join(" ")} ${p.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="container page-body">
      <PageHeading
        eyebrow="THE NEXORA WORKBENCH"
        title="Built with curiosity."
        text="Circuits, code, and a little creative thinking. Explore our sample projects and find inspiration for your own."
      />
      <div className="project-controls">
        <div className="filter-tabs" role="tablist" aria-label="Project category">
          {categories.map((item) => (
            <Button
              role="tab"
              aria-selected={category === item}
              key={item}
              variant={category === item ? "default" : "ghost"}
              onClick={() => {
                setCategory(item);
                setLimit(6);
              }}
            >
              {item}
            </Button>
          ))}
        </div>
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Search projects"
            placeholder="Search projects or technologies…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(6);
            }}
          />
        </div>
      </div>
      <p className="results-label">{filtered.length} projects · Sample portfolio</p>
      <div className="projects-grid">
        {filtered.slice(0, limit).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <FolderSearch size={35} />
            <h3>No projects found.</h3>
            <p>Try a different search or category.</p>
            <Button
              variant="link"
              onClick={() => {
                setQuery("");
                setCategory("All projects");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      {limit < filtered.length && (
        <div className="load-more">
          <Button variant="outline" size="lg" disabled={loading} onClick={() => setLoading(true)}>
            {loading ? <LoaderCircle className="animate-spin" /> : <ArrowDown />}
            {loading ? "Loading projects…" : "Load more"}
          </Button>
        </div>
      )}
    </main>
  );
}
