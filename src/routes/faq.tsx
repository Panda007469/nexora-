import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, ArrowRight } from "lucide-react";
import { faqs } from "@/data/site";
import { meta, PageHeading } from "@/components/nexora/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  head: () =>
    meta(
      "Frequently Asked Questions",
      "Find answers to common questions about Nexora embedded systems, hardware prototyping, VLSI design, and student project guidance.",
    ),
  component: FAQPage,
});

function FAQPage() {
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        breadcrumb={[{ label: "FAQ" }]}
      />
      <main className="container py-16 md:py-20">
        <PageHeading
          eyebrow="EVERYTHING YOU NEED TO KNOW"
          title="Got questions? We've got answers."
          text="Learn about our technical review process, supported hardware platforms, milestone delivery model, and mentorship support."
        />

        <div className="max-w-3xl mx-auto mt-12 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`faq-${index}`}
                className="border-b border-border/70 last:border-b-0 py-1"
              >
                <AccordionTrigger className="font-heading font-semibold text-base sm:text-lg text-foreground hover:text-royal transition-colors text-left py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-royal/10 text-royal dark:bg-royal/20 dark:text-glow text-xs font-bold font-display">
                      Q{index + 1}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pl-10 pr-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still have questions prompt */}
        <div className="max-w-xl mx-auto mt-12 text-center p-8 rounded-2xl border border-border bg-card/50">
          <div className="flex size-12 mx-auto items-center justify-center rounded-full bg-royal/10 text-royal dark:bg-royal/20 dark:text-glow mb-4">
            <HelpCircle className="size-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground">
            Still have a question?
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 mb-6">
            Can’t find the answer you’re looking for? Reach out to our engineering team directly.
          </p>
          <Button asChild className="bg-brand-gradient text-white hover:opacity-95 shadow-md">
            <Link to="/request">
              <span>Ask Our Engineers</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
}

