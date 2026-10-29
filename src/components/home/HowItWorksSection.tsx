import { howItWorks } from "@/data/site";

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-background text-foreground overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
            <span>OUR PROCESS</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            From initial concept to full handover, our streamlined 6-step collaborative methodology
            ensures transparent, predictable prototype delivery.
          </p>
        </div>

        {/* 6 Steps: single row on desktop, stacked on mobile, joined by a thin line */}
        <div className="relative">
          {/* Continuous thin horizontal line on desktop connecting all 6 steps */}
          <div
            className="hidden lg:block absolute top-7 left-[8.33%] right-[8.33%] h-[2px] bg-border/80 z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-4 relative z-10">
            {howItWorks.map((step, index) => {
              const formattedNumber = String(step.step).padStart(2, "0");
              return (
                <div
                  key={step.step}
                  className="relative flex items-start lg:items-center lg:flex-col lg:text-center group"
                >
                  {/* Vertical connecting line for mobile (stacked) */}
                  {index < howItWorks.length - 1 && (
                    <div
                      className="lg:hidden absolute left-6 sm:left-7 top-14 -bottom-4 w-[2px] bg-border/80 -translate-x-1/2 z-0"
                      aria-hidden="true"
                    />
                  )}

                  {/* Numbered bg-brand-gradient Circle */}
                  <div className="relative z-10 flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white font-heading font-bold text-base sm:text-lg shadow-md ring-4 ring-background transition-transform duration-300 group-hover:scale-110">
                    {formattedNumber}
                  </div>

                  {/* Content: Title & One line of text */}
                  <div className="ml-4 sm:ml-5 lg:ml-0 lg:mt-5 flex-1">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-foreground tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

