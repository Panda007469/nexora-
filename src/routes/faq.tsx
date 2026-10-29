import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, MessageSquare } from "lucide-react";
import { faqs } from "@/data/site";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeUp } from "@/components/layout/FadeUp";
import { meta } from "@/components/nexora/shared";

export const Route = createFileRoute("/faq")({
  head: () =>
    meta(
      "Frequently Asked Questions",
      "Answers to common questions regarding Nexora project timelines, hardware component sourcing, milestones, and deliverables.",
    ),
  component: FaqPage,
});

function FaqPage() {
  // Group FAQs by topic
  const groupedFaqs = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const topic = faq.topic ?? "General Inquiries";
    if (!acc[topic]) {
      acc[topic] = [];
    }
    acc[topic].push(faq);
    return acc;
  }, {});

  const topics = Object.keys(groupedFaqs);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        title="Frequently Asked Questions"
        breadcrumb={[{ label: "FAQ" }]}
      />

      <main className="container py-12 md:py-20 max-w-4xl">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
            <HelpCircle className="size-3.5" />
            <span>KNOWLEDGE BASE</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
            Everything You Need to Know
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Transparent answers about our engineering methodology, component sourcing, milestone quotes, and student collaboration.
          </p>
        </div>

        {/* Accordions Grouped by Topic */}
        <div className="space-y-10 md:space-y-14">
          {topics.map((topic, groupIndex) => {
            const items = groupedFaqs[topic];
            const groupNum = String(groupIndex + 1).padStart(2, "0");

            return (
              <FadeUp key={topic} delay={groupIndex * 0.08}>
                <section
                  aria-labelledby={`faq-topic-${groupIndex}`}
                  className="rounded-3xl border border-border bg-card p-6 sm:p-8 md:p-10 shadow-sm"
                >
                  {/* Topic Header */}
                  <div className="flex items-center gap-3 pb-6 border-b border-border/70 mb-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white text-xs font-heading font-bold shadow-2xs">
                      {groupNum}
                    </span>
                    <h2
                      id={`faq-topic-${groupIndex}`}
                      className="font-heading font-bold text-xl sm:text-2xl text-foreground tracking-tight"
                    >
                      {topic}
                    </h2>
                  </div>

                  {/* Accordion for this Topic */}
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue={groupIndex === 0 ? "item-0" : undefined}
                    className="w-full divide-y divide-border/60"
                  >
                    {items.map((faq, itemIndex) => (
                      <AccordionItem
                        key={faq.question}
                        value={`item-${itemIndex}`}
                        className="border-none py-2"
                      >
                        <AccordionTrigger className="font-heading font-semibold text-base sm:text-lg text-foreground hover:text-royal transition-colors text-left py-4">
                          <span className="pr-4">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm leading-relaxed pr-6 pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              </FadeUp>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <FadeUp delay={0.2} className="mt-14 md:mt-18">
          <div className="rounded-3xl bg-brand-gradient p-8 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-xs mb-3">
                <MessageSquare className="size-3.5" />
                <span>DIRECT ENGINEER ACCESS</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight leading-tight">
                Still have an unanswered question?
              </h3>
              <p className="mt-2 text-white/85 text-xs sm:text-sm max-w-md leading-relaxed">
                Reach out with your project ideas or specific circuit component requirements. We respond within 24 hours.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="bg-white text-navy font-semibold hover:bg-white/90 shadow-md transition-all h-12 px-7 rounded-xl text-sm shrink-0 cursor-pointer"
            >
              <Link to="/request">
                <span>Start Your Request</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </FadeUp>
      </main>
    </div>
  );
}
