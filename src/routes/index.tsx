import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CircuitBoard, Cpu, Code2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { images, services, steps } from "@/data/site";
import { projects } from "@/data/projects";
import {
  RequestLink,
  ServiceCard,
  ProjectCard,
  TextLink,
  meta,
} from "@/components/nexora/shared";

export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "Student ideas. Real-world projects.",
      "Nexora is a student-led team building hardware, embedded systems and front-end projects, with friendly technical guidance.",
    ),
  component: Home,
});

function Home() {
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={images.hero}
          alt="Microcontrollers, circuits and prototyping tools on the Nexora workbench"
          width={1536}
          height={1024}
        />
        <div className="container hero-content">
          <span className="availability">
            <span className="small-dot" /> AVAILABLE FOR STUDENT PROJECTS
          </span>
          <h1>
            Student ideas.
            <br />
            <span>Real-world</span> projects.
          </h1>
          <h2>Hardware, embedded systems, and front-end builds.</h2>
          <p>
            You bring the curiosity and the concept. Nexora provides the technical hands-on support
            to build, refine, and bring it to life.
          </p>
          <div className="hero-actions">
            <RequestLink>
              Start your project
            </RequestLink>
            <Button asChild variant="outline">
              <Link to="/projects">Explore our work</Link>
            </Button>
          </div>
          <div className="hero-proof">
            <div className="mini-avatars">
              <span>
                <img
                  src={images.team}
                  alt="Portrait photo of Arjun Kumar, Hardware and Embedded lead"
                />
              </span>
              <span>
                <img
                  src={images.team}
                  alt="Portrait photo of Priya Sharma, Front-end developer"
                />
              </span>
              <span>
                <img
                  src={images.team}
                  alt="Portrait photo of Rahul Verma, Embedded developer"
                />
              </span>
            </div>
            <span>
              Built by students, for students. <strong>Available this semester.</strong>
            </span>
          </div>
        </div>
      </section>
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
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WHAT WE BUILD</span>
            <h2>Four ways we can help you build.</h2>
            <p>From circuit boards to websites, we turn ambitious concepts into working reality.</p>
          </div>
          <TextLink to="/services">All services</TextLink>
        </div>
        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard service={service} key={service.id} />
          ))}
        </div>
      </section>
      <section className="featured-section section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">RECENT BUILDS</span>
              <h2>Projects from the workbench.</h2>
              <p>Sample hardware, embedded devices, and web applications built by Nexora.</p>
            </div>
            <TextLink to="/projects">All projects</TextLink>
          </div>
          <div className="projects-grid">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard project={project} key={project.id} />
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE PROCESS</span>
            <h2>From “what if” to “here it is.”</h2>
          </div>
          <span className="text-link">Three simple steps.</span>
        </div>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <article className="step" key={step.label}>
              <span className="step-number">0{i + 1}</span>
              <h3>{step.label}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
