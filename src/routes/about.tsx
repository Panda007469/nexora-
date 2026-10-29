import { createFileRoute } from "@tanstack/react-router";
import { Github, Linkedin } from "lucide-react";
import { team } from "@/data/site";
import { PageHeading, meta } from "@/components/nexora/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { InitialsAvatar } from "@/components/layout/InitialsAvatar";

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
      <PageHeader
        title="About Us"
        breadcrumb={[{ label: "About" }]}
      />
      <main className="container page-body">
        <PageHeading
          eyebrow="THREE MINDS. ONE NEXORA."
          title="Students. Builders. Your project partners."
          text="We’re a small team with a big curiosity for how things work. We bring hardware, embedded systems, and front-end skills together to help fellow students move from idea to reality."
        />
        <div className="team-grid">
          {team.map((member) => (
            <article className="team-card flex flex-col items-center text-center p-8 transition-transform hover:-translate-y-1" key={member.name}>
              <div className="mb-6 flex justify-center">
                <InitialsAvatar
                  name={member.name}
                  photo={member.photo}
                  size="lg"
                />
              </div>
              <div className="team-details p-0 w-full flex flex-col items-center">
                <h3 className="font-heading font-bold text-xl">{member.name}</h3>
                <p className="text-sm text-royal font-medium my-2">{member.role}</p>
                <div className="chips flex flex-wrap justify-center gap-2 my-4">
                  {member.skills.map((skill) => (
                    <span key={skill} className="rounded-full px-3 py-1 bg-muted text-muted-foreground text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="socials flex justify-center gap-4 mt-2">
                  <a
                    aria-label={`${member.name} GitHub`}
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github size={18} />
                  </a>
                  <a
                    aria-label={`${member.name} LinkedIn`}
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
