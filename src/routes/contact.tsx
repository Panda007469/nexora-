import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Clock, MapPin, Send, CheckCircle2, LoaderCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { contact } from "@/data/site";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeUp } from "@/components/layout/FadeUp";
import { meta } from "@/components/nexora/shared";

const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name (at least 2 characters)."),
  email: z.string().trim().email("Please enter a valid email address."),
  message: z.string().trim().min(10, "Please enter a message with at least 10 characters."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const Route = createFileRoute("/contact")({
  head: () =>
    meta(
      "Contact Us",
      "Get in touch with the Nexora engineering team for hardware prototyping questions, project consultations, or technical guidance.",
    ),
  component: ContactPage,
});

function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Browser-only simulated submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      reset();
      toast.success("Message sent successfully!", {
        description: `Thank you, ${data.name}. We have received your note and will reply to ${data.email} within 24 hours.`,
      });
    }, 600);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        title="Contact Us"
        breadcrumb={[{ label: "Contact" }]}
      />

      <main className="container py-12 md:py-20">
        {/* Intro */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
            <MessageSquare className="size-3.5" />
            <span>GET IN TOUCH</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
            Let's Talk About Your Next Hardware or Software Project
          </h1>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Have questions about microcontroller compatibility, PCB schematics, or milestone timelines? 
            Drop us a message or reach out through our engineering desk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Contact Detail Cards from site.ts */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <FadeUp delay={0.05}>
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-2xs">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </span>
                    <h3 className="font-heading font-bold text-lg text-foreground mt-0.5">
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:text-royal transition-colors"
                      >
                        {contact.email}
                      </a>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Drop us your problem statement anytime. We reply within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-royal/10 text-royal dark:bg-royal/20 dark:text-glow border border-royal/20">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground">
                      Working Hours
                    </span>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-foreground mt-0.5">
                      {contact.workingHours}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active workbench hours for scheduled live design reviews and code walkthroughs.
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet/10 text-violet dark:bg-violet/20 dark:text-glow border border-violet/20">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground">
                      Innovation Lab
                    </span>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-foreground mt-0.5">
                      {contact.city}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Student engineering collective and hardware prototyping workbench.
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Right Column: Contact Form with Zod & React Hook Form */}
          <div className="lg:col-span-7">
            <FadeUp delay={0.1}>
              <div className="rounded-3xl border border-border bg-card p-7 sm:p-10 shadow-lg relative overflow-hidden">
                <div className="mb-6">
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
                    Send Us a Message
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                    Fill out the form below and an engineering lead will get back to you shortly.
                  </p>
                </div>

                {submitted ? (
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center my-6">
                    <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Thank you for contacting Nexora. We have received your message and will review it promptly.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                      className="mt-5 rounded-xl border-border text-xs font-semibold"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                      >
                        Your Name <span className="text-magenta">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        disabled={isSubmitting}
                        {...register("name")}
                        className={`w-full h-11 rounded-xl px-4 text-sm bg-background border ${
                          errors.name
                            ? "border-destructive focus:ring-destructive/30"
                            : "border-border focus:border-royal focus:ring-royal/30"
                        } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-xs text-destructive mt-1.5 font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                      >
                        Email Address <span className="text-magenta">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="you@college.edu or personal email"
                        disabled={isSubmitting}
                        {...register("email")}
                        className={`w-full h-11 rounded-xl px-4 text-sm bg-background border ${
                          errors.email
                            ? "border-destructive focus:ring-destructive/30"
                            : "border-border focus:border-royal focus:ring-royal/30"
                        } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-xs text-destructive mt-1.5 font-medium">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Message Field */}
                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                      >
                        Your Message <span className="text-magenta">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        rows={5}
                        placeholder="Briefly describe your question, project idea, or component query..."
                        disabled={isSubmitting}
                        {...register("message")}
                        className={`w-full rounded-xl p-4 text-sm bg-background border ${
                          errors.message
                            ? "border-destructive focus:ring-destructive/30"
                            : "border-border focus:border-royal focus:ring-royal/30"
                        } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all resize-y`}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error" : undefined}
                      />
                      {errors.message && (
                        <p id="message-error" className="text-xs text-destructive mt-1.5 font-medium">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-brand-gradient text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all h-12 rounded-xl text-sm font-semibold cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="size-4 animate-spin mr-2" />
                          <span>Sending message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="size-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </FadeUp>
          </div>
        </div>
      </main>
    </div>
  );
}

