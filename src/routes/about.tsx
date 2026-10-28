import { createFileRoute } from "@tanstack/react-router";
import { Github, Linkedin } from "lucide-react";
import { team, images } from "@/data/site";
import { PageHeading, CtaBand, meta } from "@/components/nexora/shared";
export const Route = createFileRoute("/about")({
  head: () =>
    meta(
      "About our team",
      "Meet Nexora, a three-member student services team with a shared passion for hardware, embedded systems and the web.",
    ),
  component: About,
});
function About() {
  return (
    <>
      <main className="container page-body">
        <PageHeading
          eyebrow="THREE MINDS. ONE NEXORA."
          title="Students. Builders. Your project partners."
          text="We’re a small team with a big curiosity for how things work. We bring hardware, embedded systems, and front-end skills together to help fellow students move from idea to reality."
        />
        <p className="placeholder-note about-note">
          All names, roles, skills, photos, and social links below are illustrative placeholders.
        </p>
        <div className="team-grid">
          {team.map((member) => (
            <article className="team-card" key={member.name}>
              <div className={`team-photo team-photo-${member.photo}`}>
                <img
                  src={images.team}
                  alt={`Illustrative portrait for ${member.name} (placeholder)`}
                  width={1536}
                  height={512}
                  loading="lazy"
                />
              </div>
              <div className="team-details">
                <h3>{member.name}</h3>
                <p>{member.role}</p>
                <div className="chips">
                  {member.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <div className="socials">
                  <a
                    aria-label={`${member.name} GitHub (placeholder)`}
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github size={18} />
                  </a>
                  <a
                    aria-label={`${member.name} LinkedIn (placeholder)`}
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <CtaBand />
    </>
  );
}
