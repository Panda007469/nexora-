import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { faqs } from "@/data/site";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export function FaqPreviewSection() {
  const previewFaqs = faqs.slice(0, 5);

  return (
    <section className="py-16 md:py-24 bg-background text-foreground overflow-hidden">
      <div className="container">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
              <span>FAQ</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base leading-relaxed">
              Quick answers about project kickoffs, component feasibility, pricing milestones, and technical mentorship.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="self-start md:self-end h-10 px-5 text-xs font-semibold rounded-lg border-border hover:bg-accent"
          >
            <Link to="/faq">
              <span>View all FAQs</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* 5 Accordion Items */}
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
            {previewFaqs.map((faq, index) => (
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

        {/* Mobile View All FAQs Button */}
        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full border-border">
            <Link to="/faq">
              <span>View all FAQs</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

