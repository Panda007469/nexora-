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
  CtaBand,
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
            <span className="small-dot" />
            STUDENT-LED. BUILT WITH PURPOSE.
          </span>
          <h1>
            Nexora<span>.</span>
          </h1>
          <h2>
            Your ideas. Our expertise.
            <br />
            Something extraordinary.
          </h2>
          <p>
            From circuits to code, we turn ambitious ideas into real-world projects. A team of three
            students, here to help you build, learn, and move forward.
          </p>
          <div className="hero-actions">
            <RequestLink />
            <Button asChild variant="outline" size="lg">
              <Link to="/projects">
                Explore projects
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="hero-proof">
            <div className="mini-avatars">
              {[0, 1, 2].map((i) => (
                <span key={i}>
                  <img
                    src={images.team}
                    alt="Illustrative team portrait"
                    width={1536}
                    height={512}
                  />
                </span>
              ))}
            </div>
            <span>
              <strong>3 curious minds.</strong> One shared passion for building.
            </span>
          </div>
        </div>
      </section>
      <div className="trust-strip">
        <div className="container trust-inner">
          <span className="trust-label">IDEAS WITHOUT LIMITS</span>
          <span>
            <CircuitBoard />
            Hardware & Prototyping
          </span>
          <span>
            <Cpu />
            Embedded & IoT
          </span>
          <span>
            <Code2 />
            Front-End Development
          </span>
          <span>
            <GraduationCap />
            Student to Student
          </span>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WHAT WE DO</span>
            <h2>A little expertise. A lot of possibility.</h2>
            <p>The right support for whatever you’re building next.</p>
          </div>
          <TextLink to="/services">All services</TextLink>
        </div>
        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard service={service} key={service.id} />
          ))}
        </div>
      </section>
      <section className="section featured-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM OUR WORKBENCH</span>
              <h2>Ideas brought to life.</h2>
              <p>A glimpse into the things we love to build.</p>
            </div>
            <TextLink to="/projects">View all projects</TextLink>
          </div>
          <div className="projects-grid">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">HOW IT WORKS</span>
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
      <CtaBand />
    </>
  );
}
