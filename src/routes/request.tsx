import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  CheckCircle2,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Cpu,
  CircuitBoard,
  Code2,
  GraduationCap,
  Calendar,
  Check,
  Edit2,
  User,
  School,
  Mail,
  FileText,
  Clock,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { services, steps } from "@/data/site";
import { requestSchema } from "@/data/request";
import { meta } from "@/components/nexora/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeUp } from "@/components/layout/FadeUp";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const iconMap = {
  embedded: Cpu,
  hardware: CircuitBoard,
  frontend: Code2,
  advice: GraduationCap,
} as const;

export const Route = createFileRoute("/request")({
  validateSearch: (search: Record<string, unknown>): { service?: string | undefined } => ({
    service: typeof search["service"] === "string" ? search["service"] : undefined,
  }),
  head: () =>
    meta(
      "Request a Service",
      "Tell Nexora about your student project and the engineering prototyping support you need.",
    ),
  component: Request,
});

const STEPS = [
  { id: "contact", label: "Contact Details", short: "You" },
  { id: "scope", label: "Service & Timeline", short: "Scope" },
  { id: "brief", label: "Project Brief", short: "Brief" },
  { id: "review", label: "Review & Submit", short: "Review" },
] as const;

// Per-step schemas using exact field definitions from requestSchema
const step1Schema = z.object({
  name: requestSchema.shape.name,
  college: requestSchema.shape.college,
  email: requestSchema.shape.email,
});

const step2Schema = z.object({
  service: requestSchema.shape.service,
  deadline: requestSchema.shape.deadline,
});

const step3Schema = z.object({
  description: requestSchema.shape.description,
});

function mapToRpcPayload(v: {
  name: string;
  email: string;
  college: string;
  service: string;
  description: string;
  deadline: string;
}) {
  return {
    name: v.name,
    email: v.email,
    phone: "",
    org: v.college,
    city: "",
    customer_type: "student",
    service: v.service,
    idea: v.description,
    tech_details: "",
    deliverables: "",
    deadline: v.deadline,
    budget: "",
  };
}

function Request() {
  const search = Route.useSearch();
  const [currentStep, setCurrentStep] = useState(0);

  const [values, setValues] = useState({
    name: "",
    college: "",
    email: "",
    service: search.service ?? "",
    description: "",
    deadline: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [copied, setCopied] = useState(false);

  function update(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // Validate current step before advancing
  function handleNext() {
    if (currentStep === 0) {
      const result = step1Schema.safeParse({
        name: values.name,
        college: values.college,
        email: values.email,
      });
      if (!result.success) {
        const nextErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          nextErrors[String(issue.path[0])] = issue.message;
        });
        setErrors(nextErrors);
        return;
      }
    } else if (currentStep === 1) {
      const result = step2Schema.safeParse({
        service: values.service,
        deadline: values.deadline,
      });
      if (!result.success) {
        const nextErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          nextErrors[String(issue.path[0])] = issue.message;
        });
        setErrors(nextErrors);
        return;
      }
    } else if (currentStep === 2) {
      const result = step3Schema.safeParse({
        description: values.description,
      });
      if (!result.success) {
        const nextErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          nextErrors[String(issue.path[0])] = issue.message;
        });
        setErrors(nextErrors);
        return;
      }
    }

    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }

  function handleBack() {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = requestSchema.safeParse(values);
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        next[String(issue.path[0])] = issue.message;
      });
      setErrors(next);

      // Return to first step with an error
      if (next.name || next.college || next.email) {
        setCurrentStep(0);
      } else if (next.service || next.deadline) {
        setCurrentStep(1);
      } else if (next.description) {
        setCurrentStep(2);
      }
      return;
    }

    setErrors({});
    setStatus("loading");

    const { data, error } = await supabase.rpc("submit_request", {
      p: mapToRpcPayload(values),
    });

    if (error) {
      setStatus("idle");
      toast.error("Submission failed", { description: error.message });
      return;
    }

    setTrackingCode(data?.[0]?.code ?? "");
    setTrackingToken(data?.[0]?.token ?? "");
    setStatus("success");
  }

  const selectedServiceObj = services.find((s) => s.id === values.service);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        title="Request a Service"
        breadcrumb={[{ label: "Request" }]}
      />

      <main className="container py-12 md:py-20">
        {/* Intro */}
        <div className="max-w-3xl mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3.5 py-1 text-royal dark:text-glow text-xs font-bold font-display uppercase tracking-widest mb-3">
            <span>START A PROJECT</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
            Tell Us What You Have in Mind
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            A concept, a breadboard build in need of debugging, or an end-to-end prototype. Complete our 4-step request form to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Main Stepper Form Column */}
          <div className="lg:col-span-8">
            <FadeUp>
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-lg relative">
                {/* Stepper Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between text-xs font-bold font-display uppercase tracking-wider text-muted-foreground mb-3">
                    <span>
                      Step {currentStep + 1} of {STEPS.length}:{" "}
                      <span className="text-foreground">{STEPS[currentStep].label}</span>
                    </span>
                    <span className="text-royal dark:text-glow">
                      {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
                    </span>
                  </div>

                  {/* bg-brand-gradient progress bar */}
                  <div className="w-full bg-border/60 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-gradient transition-all duration-300 ease-out"
                      style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                  </div>

                  {/* Step indicators */}
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {STEPS.map((s, idx) => {
                      const isDone = idx < currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            // Allow navigating backward freely
                            if (idx < currentStep) {
                              setCurrentStep(idx);
                            }
                          }}
                          disabled={idx > currentStep}
                          className={cn(
                            "flex flex-col items-center text-center transition-colors pb-1",
                            idx <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                          )}
                        >
                          <div
                            className={cn(
                              "size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1",
                              isDone
                                ? "bg-emerald-500 text-white shadow-2xs"
                                : isCurrent
                                ? "bg-brand-gradient text-white shadow-sm ring-4 ring-royal/20"
                                : "bg-muted text-muted-foreground border border-border",
                            )}
                          >
                            {isDone ? <Check className="size-4 stroke-[3]" /> : idx + 1}
                          </div>
                          <span
                            className={cn(
                              "text-[11px] font-semibold hidden sm:inline truncate max-w-full",
                              isCurrent ? "text-foreground font-bold" : "text-muted-foreground",
                            )}
                          >
                            {s.short}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Success View */}
                {status === "success" ? (
                  <section className="py-8 text-center" role="status">
                    <div className="size-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground mb-2">
                      {`You're all set, ${values.name.split(" ")[0]}!`}
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                      Your request has been submitted. An engineering lead will review it and reply to{" "}
                      <strong className="text-foreground">{values.email}</strong> within 24 hours.
                    </p>

                    {/* Tracking info */}
                    {trackingCode && (
                      <div className="p-5 rounded-2xl border border-border bg-background/50 max-w-md mx-auto mb-6 text-left space-y-4">
                        <div>
                          <span className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground block mb-1">
                            Your Tracking Code
                          </span>
                          <span className="font-heading font-extrabold text-2xl text-foreground tracking-widest">
                            {trackingCode}
                          </span>
                        </div>

                        {trackingToken && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <a
                              href={`/track?token=${trackingToken}`}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal dark:text-glow underline underline-offset-4 hover:opacity-80 transition-opacity"
                            >
                              <ArrowUpRight className="size-4" />
                              Track your request
                            </a>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(trackingToken);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="h-8 rounded-lg text-xs border-border"
                            >
                              {copied ? (
                                <>
                                  <Check className="size-3 mr-1.5 text-emerald-500" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3 mr-1.5" /> Copy token
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary badge */}
                    <div className="p-4 rounded-2xl border border-border bg-background/50 max-w-md mx-auto mb-8 text-xs text-muted-foreground text-left space-y-1.5">
                      <div>
                        <strong>Service:</strong> {selectedServiceObj?.name ?? values.service}
                      </div>
                      <div>
                        <strong>College:</strong> {values.college}
                      </div>
                      <div>
                        <strong>Target Deadline:</strong> {values.deadline}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setStatus("idle");
                        setCurrentStep(0);
                        setTrackingCode("");
                        setTrackingToken("");
                        setCopied(false);
                        setValues({
                          name: "",
                          college: "",
                          email: "",
                          service: "",
                          description: "",
                          deadline: "",
                        });
                      }}
                      className="bg-brand-gradient text-white px-7 rounded-xl font-semibold shadow-md"
                    >
                      Create another request
                    </Button>
                  </section>
                ) : (
                  <form onSubmit={submit} noValidate>
                    {/* STEP 1: Contact Details */}
                    {currentStep === 0 && (
                      <div className="space-y-6 animate-in fade-in-50 duration-200">
                        <div>
                          <h2 className="font-heading font-bold text-xl text-foreground">
                            Personal &amp; Academic Information
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Let us know who you are and where you are studying.
                          </p>
                        </div>

                        {/* Name */}
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                          >
                            Full Name <span className="text-magenta">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input
                              id="name"
                              type="text"
                              autoComplete="name"
                              value={values.name}
                              placeholder="e.g. Arjun Sharma"
                              onChange={(e) => update("name", e.target.value)}
                              aria-invalid={!!errors.name}
                              aria-describedby={errors.name ? "name-error" : undefined}
                              className={cn(
                                "w-full h-11 rounded-xl pl-10 pr-4 text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                                errors.name
                                  ? "border-destructive focus:ring-destructive/30"
                                  : "border-border focus:border-royal focus:ring-royal/30",
                              )}
                            />
                          </div>
                          {errors.name && (
                            <p id="name-error" className="text-xs text-destructive mt-1.5 font-medium">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        {/* College */}
                        <div>
                          <label
                            htmlFor="college"
                            className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                          >
                            College / University <span className="text-magenta">*</span>
                          </label>
                          <div className="relative">
                            <School className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input
                              id="college"
                              type="text"
                              autoComplete="organization"
                              value={values.college}
                              placeholder="e.g. RV College of Engineering"
                              onChange={(e) => update("college", e.target.value)}
                              aria-invalid={!!errors.college}
                              aria-describedby={errors.college ? "college-error" : undefined}
                              className={cn(
                                "w-full h-11 rounded-xl pl-10 pr-4 text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                                errors.college
                                  ? "border-destructive focus:ring-destructive/30"
                                  : "border-border focus:border-royal focus:ring-royal/30",
                              )}
                            />
                          </div>
                          {errors.college && (
                            <p id="college-error" className="text-xs text-destructive mt-1.5 font-medium">
                              {errors.college}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                          >
                            Email Address <span className="text-magenta">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input
                              id="email"
                              type="email"
                              autoComplete="email"
                              value={values.email}
                              placeholder="you@college.edu or personal email"
                              onChange={(e) => update("email", e.target.value)}
                              aria-invalid={!!errors.email}
                              aria-describedby={errors.email ? "email-error" : undefined}
                              className={cn(
                                "w-full h-11 rounded-xl pl-10 pr-4 text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                                errors.email
                                  ? "border-destructive focus:ring-destructive/30"
                                  : "border-border focus:border-royal focus:ring-royal/30",
                              )}
                            />
                          </div>
                          {errors.email && (
                            <p id="email-error" className="text-xs text-destructive mt-1.5 font-medium">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Service & Timeline */}
                    {currentStep === 1 && (
                      <div className="space-y-6 animate-in fade-in-50 duration-200">
                        <div>
                          <h2 className="font-heading font-bold text-xl text-foreground">
                            Service Type &amp; Completion Timeline
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Choose the discipline that fits your requirements and select your target completion date.
                          </p>
                        </div>

                        {/* Service Cards selection */}
                        <div>
                          <label className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-3">
                            Select Service Discipline <span className="text-magenta">*</span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {services.map((s) => {
                              const isSelected = values.service === s.id;
                              const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Cpu;

                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => update("service", s.id)}
                                  className={cn(
                                    "flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer",
                                    isSelected
                                      ? "border-royal bg-royal/10 dark:bg-royal/20 ring-2 ring-royal/40 shadow-xs"
                                      : "border-border bg-background hover:bg-muted/50",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                      isSelected
                                        ? "bg-brand-gradient text-white shadow-2xs"
                                        : "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    <Icon className="size-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-heading font-bold text-sm text-foreground">
                                      {s.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                      {s.short}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {errors.service && (
                            <p id="service-error" className="text-xs text-destructive mt-2 font-medium">
                              {errors.service}
                            </p>
                          )}
                        </div>

                        {/* Target Completion Date */}
                        <div>
                          <label
                            htmlFor="deadline"
                            className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                          >
                            Target Completion Date <span className="text-magenta">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input
                              id="deadline"
                              type="date"
                              value={values.deadline}
                              onChange={(e) => update("deadline", e.target.value)}
                              aria-invalid={!!errors.deadline}
                              aria-describedby={errors.deadline ? "deadline-error" : undefined}
                              className={cn(
                                "w-full h-11 rounded-xl pl-10 pr-4 text-sm bg-background border text-foreground focus:outline-none focus:ring-2 transition-all",
                                errors.deadline
                                  ? "border-destructive focus:ring-destructive/30"
                                  : "border-border focus:border-royal focus:ring-royal/30",
                              )}
                            />
                          </div>
                          {errors.deadline && (
                            <p id="deadline-error" className="text-xs text-destructive mt-1.5 font-medium">
                              {errors.deadline}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Project Brief */}
                    {currentStep === 2 && (
                      <div className="space-y-6 animate-in fade-in-50 duration-200">
                        <div>
                          <h2 className="font-heading font-bold text-xl text-foreground">
                            Project Brief &amp; Technical Requirements
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Describe what you want to build, existing components or sensors, and specific guidance needed.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="description"
                            className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                          >
                            Project Brief <span className="text-magenta">*</span>
                          </label>
                          <textarea
                            id="description"
                            rows={6}
                            value={values.description}
                            placeholder="Tell us what you're building, what components you have, pinout constraints, and where you need engineering assistance..."
                            onChange={(e) => update("description", e.target.value)}
                            aria-invalid={!!errors.description}
                            aria-describedby={errors.description ? "description-error" : undefined}
                            className={cn(
                              "w-full rounded-2xl p-4 text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all resize-y",
                              errors.description
                                ? "border-destructive focus:ring-destructive/30"
                                : "border-border focus:border-royal focus:ring-royal/30",
                            )}
                          />
                          {errors.description && (
                            <p id="description-error" className="text-xs text-destructive mt-1.5 font-medium">
                              {errors.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Final Review Step */}
                    {currentStep === 3 && (
                      <div className="space-y-6 animate-in fade-in-50 duration-200">
                        <div>
                          <h2 className="font-heading font-bold text-xl text-foreground">
                            Review Your Project Request
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Please check your details before submitting. You can edit any section below.
                          </p>
                        </div>

                        {/* Review Card 1: Contact */}
                        <div className="rounded-2xl border border-border bg-background/60 p-5">
                          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                            <div className="flex items-center gap-2 text-xs font-bold font-display uppercase text-royal dark:text-glow">
                              <User className="size-3.5" />
                              <span>Personal &amp; Academic Details</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentStep(0)}
                              className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="size-3 mr-1" /> Edit
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground block">Full Name:</span>
                              <strong className="text-foreground text-sm">{values.name || "—"}</strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">College:</span>
                              <strong className="text-foreground text-sm">{values.college || "—"}</strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Email:</span>
                              <strong className="text-foreground text-sm">{values.email || "—"}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Review Card 2: Service & Deadline */}
                        <div className="rounded-2xl border border-border bg-background/60 p-5">
                          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                            <div className="flex items-center gap-2 text-xs font-bold font-display uppercase text-royal dark:text-glow">
                              <Cpu className="size-3.5" />
                              <span>Service &amp; Timeline</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentStep(1)}
                              className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="size-3 mr-1" /> Edit
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground block">Selected Service:</span>
                              <strong className="text-foreground text-sm">
                                {selectedServiceObj?.name ?? values.service ?? "—"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Target Completion Date:</span>
                              <strong className="text-foreground text-sm">
                                {values.deadline || "—"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Review Card 3: Project Brief */}
                        <div className="rounded-2xl border border-border bg-background/60 p-5">
                          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                            <div className="flex items-center gap-2 text-xs font-bold font-display uppercase text-royal dark:text-glow">
                              <FileText className="size-3.5" />
                              <span>Project Brief</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentStep(2)}
                              className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="size-3 mr-1" /> Edit
                            </Button>
                          </div>
                          <p className="text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed">
                            {values.description || "—"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stepper Navigation Buttons */}
                    <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
                      {/* Back Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0 || status === "loading"}
                        className="rounded-xl border-border h-11 px-5 text-xs font-semibold cursor-pointer disabled:opacity-40"
                      >
                        <ArrowLeft className="size-3.5 mr-2" />
                        <span>Back</span>
                      </Button>

                      {/* Next or Submit Button */}
                      {currentStep < STEPS.length - 1 ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-brand-gradient text-white hover:opacity-95 shadow-md h-11 px-6 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="size-3.5 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          size="lg"
                          disabled={status === "loading"}
                          className="bg-brand-gradient text-white hover:opacity-95 shadow-md h-11 px-7 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          {status === "loading" ? (
                            <>
                              <LoaderCircle className="size-4 animate-spin mr-2" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Request</span>
                              <ArrowUpRight className="size-4 ml-1.5" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center mt-4">
                      Your data is sent securely to the Nexora team.
                    </p>
                  </form>
                )}
              </div>
            </FadeUp>
          </div>

          {/* Aside Column: "What happens next?" */}
          <aside className="lg:col-span-4">
            <FadeUp delay={0.15}>
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
                <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3 py-1 text-royal dark:text-glow text-[11px] font-bold font-display uppercase tracking-widest mb-4">
                  <Clock className="size-3" />
                  <span>PROJECT TIMELINE</span>
                </div>
                <h3 className="font-heading font-extrabold text-xl text-foreground mb-6">
                  What Happens Next?
                </h3>

                <div className="space-y-6">
                  {steps.map((step, i) => (
                    <div key={step.label} className="flex items-start gap-4">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white text-xs font-heading font-bold shadow-2xs">
                        0{i + 1}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-foreground">
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border/70 text-xs text-muted-foreground">
                  <p>
                    <strong>Prompt Engineering Review:</strong> Every inquiry is reviewed by student leads with hands-on workbench experience.
                  </p>
                </div>
              </div>
            </FadeUp>
          </aside>
        </div>
      </main>
    </div>
  );
}
