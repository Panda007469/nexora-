import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { meta } from "@/components/nexora/shared";
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
  return (
    <main className="container page-body">
      <Link to="/projects" className="detail-back">
        <ArrowLeft size={16} />
        Back to projects
      </Link>
      <header className="detail-heading">
        <span className="category">{project.category}</span>
        <h1>{project.title}</h1>
      </header>
      <div className="detail-grid">
        <div>
          <img
            className="gallery-main"
            src={project.gallery[active]}
            alt={`${project.title} — gallery image ${active + 1}`}
            width={1024}
            height={768}
          />
          <div className="gallery-thumbs">
            {project.gallery.map((image, i) => (
              <Button
                key={`${image}-${i}`}
                variant="ghost"
                aria-label={`Show image ${i + 1}`}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                <img src={image} alt="" width={1024} height={768} />
              </Button>
            ))}
          </div>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">PROJECT OVERVIEW</span>
          <h2>The idea behind the build.</h2>
          <p>{project.summary}</p>
          <h2>Tech used</h2>
          <div className="chips">
            {project.tech.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
          <div className="detail-links">
            <Button asChild>
              <a href={project.demoUrl} target="_blank" rel="noreferrer">
                View demo
                <ExternalLink />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                <Github />
                GitHub
              </a>
            </Button>
          </div>
          <p className="placeholder-note">
            Sample project, illustrative images, and placeholder links.
          </p>
          <Button asChild variant="link">
            <Link to="/request">Have something similar in mind?</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
