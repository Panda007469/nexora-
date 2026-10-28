import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Cpu, CircuitBoard, Code2, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services } from "@/data/site";
import type { projects } from "@/data/projects";
import logo from "@/assets/nexora-logo.png";
export function Brand() {
  return (
    <span className="brand">
      <img src={logo} alt="" aria-hidden="true" className="brand-logo" width={40} height={40} />
      Nexora<span className="brand-dot">.</span>
    </span>
  );
}
export function RequestLink({ children = "Request a service" }: { children?: React.ReactNode }) {
  return (
    <Button asChild size="lg">
      <Link to="/request">
        {children}
        <ArrowUpRight />
      </Link>
    </Button>
  );
}
export function PageHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <header className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </header>
  );
}
export function ServiceCard({
  service,
  full = false,
}: {
  service: (typeof services)[number];
  full?: boolean;
}) {
  const Icon =
    { hardware: CircuitBoard, embedded: Cpu, frontend: Code2, advice: GraduationCap }[
      service.icon
    ] ?? Cpu;
  return (
    <article className="service-card">
      <span className={`service-icon icon-${service.icon}`}>
        <Icon size={23} />
      </span>
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      {full && (
        <div className="chips">
          {service.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      <Button asChild variant="link" className="service-link">
        <Link to="/request" search={{ service: service.id }}>
          {full ? "Request this" : "Explore service"}
          <ArrowUpRight size={15} />
        </Link>
      </Button>
    </article>
  );
}
export function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <article className="project-card">
      <Link to="/projects/$slug" params={{ slug: project.slug }} className="project-image">
        <img src={project.image} alt={project.title} width={1024} height={768} loading="lazy" />
        <span className="project-open">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="project-info">
        <span className="category">{project.category}</span>
        <h3>
          <Link to="/projects/$slug" params={{ slug: project.slug }}>
            {project.title}
          </Link>
        </h3>
        <div className="chips">
          {project.tech.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
export function CtaBand() {
  return (
    <section className="cta-band container">
      <div>
        <span className="eyebrow">LET’S BUILD SOMETHING</span>
        <h2>Your next idea starts here.</h2>
        <p>A project in mind? A question you’re stuck on? We’re all ears.</p>
      </div>
      <RequestLink />
    </section>
  );
}
export function TextLink({
  to,
  children,
}: {
  to: "/projects" | "/services" | "/about";
  children: React.ReactNode;
}) {
  return (
    <Link to={to} className="text-link">
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
export function meta(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | Nexora` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | Nexora` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
