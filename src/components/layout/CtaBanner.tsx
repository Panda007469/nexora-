import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-brand-gradient py-14 sm:py-16 text-white my-10 rounded-2xl mx-4 sm:mx-6 md:mx-auto max-w-6xl shadow-xl">
      {/* Decorative subtle pattern / glow */}
      <div
        className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -left-16 -bottom-16 size-64 rounded-full bg-black/15 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-6 sm:px-10">
        <div className="text-center md:text-left">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Ready to build your project?
          </h2>
          <p className="text-white/85 text-sm sm:text-base max-w-xl">
            From embedded IoT prototypes to full-stack applications, let's turn your ideas into functional, production-ready reality.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="bg-white text-navy font-semibold hover:bg-white/90 shadow-md hover:shadow-lg transition-all text-sm shrink-0 px-6 py-3 rounded-full"
        >
          <Link to="/request" className="inline-flex items-center gap-2">
            <span>Start Your Project</span>
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>
    </section>
  );
}

