import { Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHECKLIST_ITEMS = [
  "Free first consultation",
  "Clear quote before we start",
  "Support until delivery",
] as const;

export function HomeCtaBand() {
  return (
    <section className="relative overflow-hidden bg-brand-gradient py-14 sm:py-16 md:py-20 text-white my-12 md:my-16 shadow-xl">
      {/* Decorative ambient background accents */}
      <div
        className="absolute -right-16 -top-16 size-72 sm:size-96 rounded-full bg-white/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -left-16 -bottom-16 size-72 sm:size-96 rounded-full bg-black/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container relative z-10 px-6 sm:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16">
          {/* Left: Circular /images/cta-round.webp */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="relative size-44 sm:size-52 md:size-60 lg:size-72 rounded-full overflow-hidden border-4 border-white/25 shadow-2xl bg-navy/30">
              <img
                src="/images/cta-round.webp"
                alt="Nexora embedded engineering and hardware prototyping"
                width={1254}
                height={1254}
                loading="lazy"
                className="size-full object-cover object-center transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Right: Heading, Checklist, White "Learn more" Button */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-white text-xs font-bold font-display uppercase tracking-widest mb-3 backdrop-blur-xs">
              <span>GET STARTED</span>
            </div>

            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-4">
              We're Ready to Build Your Idea
            </h2>

            {/* 3-item checklist */}
            <ul className="space-y-3 mb-6 sm:mb-8 text-left w-full sm:w-auto">
              {CHECKLIST_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm sm:text-base text-white/95 font-medium"
                >
                  <div className="flex size-5 sm:size-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs">
                    <Check className="size-3.5 sm:size-4 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* White "Learn more" button to /services */}
            <Button
              asChild
              size="lg"
              className="bg-white text-navy font-semibold hover:bg-white/90 shadow-lg hover:shadow-xl transition-all text-sm px-7 py-3 rounded-xl cursor-pointer"
            >
              <Link to="/services" className="inline-flex items-center gap-2">
                <span>Learn more</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

