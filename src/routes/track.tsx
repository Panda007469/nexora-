import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Check,
  Calendar,
  Clock,
  Receipt,
  ArrowUpRight,
  MessageCircle,
  AlertCircle,
  Info,
  LoaderCircle,
  Sparkles,
  Wrench,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { whatsappNumber } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LAST_CODE_STORAGE_KEY = "nexora_last_code";
const NOT_FOUND_MESSAGE =
  "We couldn't find a request with that code and email. Check both and try again.";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): { token?: string | undefined } => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Track Your Project | Nexora Technologies" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: TrackProjectPage,
});

const trackFormSchema = z.object({
  code: z.string().trim().min(1, "Please enter your request code."),
  email: z.string().trim().email("Please enter a valid email address."),
});

type TrackFormValues = z.infer<typeof trackFormSchema>;

interface TrackQuote {
  id?: string;
  quote_number?: string | null;
  status?: string | null;
  total?: number | string | null;
  currency?: string | null;
  valid_until?: string | null;
  approval_token?: string | null;
  token?: string | null;
}

interface TrackResult {
  request_code?: string | null;
  code?: string | null;
  status?: string | null;
  service?: string | null;
  service_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  quotes?: TrackQuote[] | null;
}

const REQUEST_STATUS_BADGES: Record<string, { label: string; className: string }> = {
  new: {
    label: "Received",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  under_review: {
    label: "Under review",
    className: "bg-royal/10 text-royal dark:text-glow border-royal/20",
  },
  consultation: {
    label: "Consultation",
    className: "bg-violet/10 text-violet dark:text-violet-300 border-violet/20",
  },
  qualified: {
    label: "Ready for quote",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  rejected: {
    label: "Not taken forward",
    className: "bg-muted text-muted-foreground border-border",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const QUOTE_STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  sent: {
    label: "Sent",
    className: "bg-royal/10 text-royal dark:text-glow border-royal/20",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  declined: {
    label: "Declined",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const PROGRESS_STEPS = [
  { step: 1, label: "Received" },
  { step: 2, label: "Under review" },
  { step: 3, label: "Consultation" },
  { step: 4, label: "Quote ready" },
  { step: 5, label: "Quote accepted" },
] as const;

const STATUS_TO_STEP: Record<string, number> = {
  new: 1,
  under_review: 2,
  consultation: 3,
  qualified: 3,
};

function computeCurrentStep(status: string, quotes: TrackQuote[]): number {
  if (quotes.some((q) => (q.status ?? "").toLowerCase() === "accepted")) return 5;
  if (quotes.some((q) => (q.status ?? "").toLowerCase() === "sent")) return 4;
  return STATUS_TO_STEP[status.toLowerCase()] ?? 1;
}

function normalizeTrackResponse(raw: unknown): TrackResult | null {
  if (!raw) return null;
  const unwrapped = Array.isArray(raw) ? raw[0] : raw;
  if (!unwrapped || typeof unwrapped !== "object") return null;

  const obj = unwrapped as Record<string, unknown>;
  const reqObj =
    obj["request"] && typeof obj["request"] === "object"
      ? (obj["request"] as Record<string, unknown>)
      : obj;

  const quotesRaw = obj["quotes"] ?? reqObj["quotes"];
  const quotes = Array.isArray(quotesRaw) ? (quotesRaw as TrackQuote[]) : [];

  return {
    request_code: (reqObj["request_code"] as string | null | undefined) ?? null,
    code: (reqObj["code"] as string | null | undefined) ?? null,
    status: (reqObj["status"] as string | null | undefined) ?? null,
    service: (reqObj["service"] as string | null | undefined) ?? null,
    service_type: (reqObj["service_type"] as string | null | undefined) ?? null,
    created_at: (reqObj["created_at"] as string | null | undefined) ?? null,
    updated_at: (reqObj["updated_at"] as string | null | undefined) ?? null,
    quotes,
  };
}

function formatMoney(amount: number | string | null | undefined, currency?: string | null) {
  const num = Number(amount ?? 0);
  const safeCurrency = currency || "INR";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(num) ? num : 0);
  } catch {
    return `₹${(Number.isFinite(num) ? num : 0).toFixed(2)}`;
  }
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function saveLastCode(code: string) {
  if (!code) return;
  try {
    localStorage.setItem(LAST_CODE_STORAGE_KEY, JSON.stringify({ code }));
  } catch {
    // Ignore storage errors (private mode / quota)
  }
}

function TrackProjectPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(Boolean(search.token));
  const [notFound, setNotFound] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      code: "",
      email: "",
    },
  });

  // Read last request code from localStorage only after client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_CODE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { code?: unknown };
      if (typeof parsed?.code === "string" && parsed.code.trim()) {
        setLastCode(parsed.code.trim());
      }
    } catch {
      // Ignore invalid or inaccessible localStorage
    }
  }, []);

  const lookupByToken = useCallback(async (token: string) => {
    setLoading(true);
    setNotFound(false);
    try {
      const { data, error } = await supabase.rpc("track_by_token", { t: token });
      if (error) {
        toast.error("Unable to look up project", { description: error.message });
        setResult(null);
        return;
      }

      const normalized = normalizeTrackResponse(data);
      if (!normalized) {
        setResult(null);
        setNotFound(true);
        return;
      }

      const resolvedCode = normalized.request_code || normalized.code || "";
      if (resolvedCode) {
        saveLastCode(resolvedCode);
        setLastCode(resolvedCode);
      }
      setResult(normalized);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to track project.";
      toast.error("Unable to look up project", { description: msg });
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // If URL has ?token=, query in browser on mount
  useEffect(() => {
    if (search.token) {
      void lookupByToken(search.token);
    }
  }, [search.token, lookupByToken]);

  const onSubmit = async (values: TrackFormValues) => {
    setLoading(true);
    setNotFound(false);
    try {
      const { data, error } = await supabase.rpc("track_by_code", {
        c: values.code.trim(),
        e: values.email.trim(),
      });

      if (error) {
        toast.error("Unable to track project", { description: error.message });
        return;
      }

      const normalized = normalizeTrackResponse(data);
      if (!normalized) {
        setResult(null);
        setNotFound(true);
        return;
      }

      const resolvedCode = normalized.request_code || normalized.code || values.code.trim();
      saveLastCode(resolvedCode);
      setLastCode(resolvedCode);
      setResult(normalized);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to look up project.";
      toast.error("Unable to track project", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleResetLookup = () => {
    setResult(null);
    setNotFound(false);
    if (search.token) {
      void navigate({ to: "/track", search: {} });
    }
  };

  const requestCode = result?.request_code || result?.code || "—";
  const rawStatus = (result?.status ?? "new").toLowerCase();
  const statusConfig = REQUEST_STATUS_BADGES[rawStatus] ?? {
    label: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).replace(/_/g, " "),
    className: "bg-muted text-muted-foreground border-border",
  };
  const serviceName = (result?.service || result?.service_type || "Engineering Project").replace(
    /-/g,
    " ",
  );
  const quotes = result?.quotes ?? [];
  const isRejected = rawStatus === "rejected";
  const currentStep = result ? computeCurrentStep(rawStatus, quotes) : 1;
  const waHref = result
    ? whatsappUrl(whatsappNumber, `Hi Nexora, my request code is ${requestCode}.`)
    : null;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader title="Track Your Project" breadcrumb={[{ label: "Track Project" }]} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-4xl space-y-8">
        {/* Loading state (especially during ?token= lookup on mount) */}
        {loading && !result && (
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <LoaderCircle className="size-8 animate-spin text-royal dark:text-glow" />
              <p className="text-xs font-display uppercase tracking-widest text-muted-foreground">
                Looking up your project status...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lookup Form (when no result yet and not currently initial token loading) */}
        {!result && !(loading && search.token) && (
          <Card className="border-border bg-card shadow-sm max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                Check Request Progress
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter your Nexora request code and the email address you submitted with it.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {notFound && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs sm:text-sm text-foreground"
                >
                  <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{NOT_FOUND_MESSAGE}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* Request Code */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label htmlFor="track-code" className="text-sm font-semibold text-foreground">
                      Request code
                    </label>
                    {lastCode && (
                      <button
                        type="button"
                        onClick={() =>
                          setValue("code", lastCode, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-royal/30 bg-royal/10 dark:bg-royal/20 px-2.5 py-0.5 text-[11px] font-medium text-royal dark:text-glow hover:bg-royal/20 transition-colors cursor-pointer"
                      >
                        <Sparkles className="size-3" />
                        <span>Use my last request code</span>
                      </button>
                    )}
                  </div>

                  <Input
                    id="track-code"
                    type="text"
                    placeholder="NX-XXXXXX"
                    autoComplete="off"
                    aria-invalid={errors.code ? "true" : "false"}
                    {...register("code")}
                    className="font-mono uppercase"
                  />
                  {errors.code && (
                    <p className="text-xs text-destructive mt-1">{errors.code.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="track-email"
                    className="block text-sm font-semibold text-foreground mb-1.5"
                  >
                    Email used in the request
                  </label>
                  <Input
                    id="track-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={errors.email ? "true" : "false"}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="size-4 mr-2 animate-spin" />
                      <span>Checking status...</span>
                    </>
                  ) : (
                    <>
                      <Search className="size-4 mr-2" />
                      <span>Track project</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Result View */}
        {result && (
          <div className="space-y-6">
            {/* Request Summary & Stepper */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-4 border-b border-border/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-display font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                      Request Code
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                        {requestCode}
                      </h2>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold px-2.5 py-0.5",
                          statusConfig.className,
                        )}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetLookup}
                    className="self-start sm:self-auto gap-1.5 rounded-xl text-xs border-border"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Track another request</span>
                  </Button>
                </div>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 text-xs sm:text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 text-foreground font-medium capitalize">
                    <Wrench className="size-3.5 text-royal dark:text-glow shrink-0" />
                    {serviceName}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0" />
                    Submitted {formatDate(result.created_at)}
                  </span>
                  {result.updated_at && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5 shrink-0" />
                      Last updated {formatDate(result.updated_at)}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Stepper or Rejected Banner */}
                {isRejected ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/50 p-4 text-sm text-foreground">
                    <Info className="size-5 text-royal dark:text-glow shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      This request was not taken forward. Contact us if you&apos;d like to discuss
                      it.
                    </p>
                  </div>
                ) : (
                  <div aria-label="Project progress">
                    <div className="grid grid-cols-5 gap-1 sm:gap-2">
                      {PROGRESS_STEPS.map((item, idx) => {
                        const isCompleted = item.step < currentStep;
                        const isActive = item.step <= currentStep;
                        const isLast = idx === PROGRESS_STEPS.length - 1;

                        return (
                          <div
                            key={item.step}
                            className="relative flex flex-col items-center text-center"
                          >
                            {/* Connector bar to next step */}
                            {!isLast && (
                              <div
                                aria-hidden="true"
                                className={cn(
                                  "absolute top-3.5 sm:top-4 left-1/2 w-full h-[2px] -z-0",
                                  item.step < currentStep ? "bg-brand-gradient" : "bg-border",
                                )}
                              />
                            )}

                            {/* Step circle */}
                            <div
                              className={cn(
                                "relative z-10 size-7 sm:size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                isActive
                                  ? "bg-brand-gradient text-white shadow-xs"
                                  : "bg-card border-2 border-border text-muted-foreground",
                              )}
                            >
                              {isCompleted ? <Check className="size-3.5 sm:size-4" /> : item.step}
                            </div>

                            {/* Step label */}
                            <span
                              className={cn(
                                "mt-2 text-[10px] sm:text-xs leading-tight font-medium px-0.5",
                                isActive
                                  ? "text-foreground font-semibold"
                                  : "text-muted-foreground",
                              )}
                            >
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WhatsApp CTA */}
                {waHref && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
                    <p className="text-xs text-muted-foreground">
                      Have a question or update to share with our team?
                    </p>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:opacity-90 transition-opacity"
                    >
                      <MessageCircle className="size-4" />
                      <span>Ask about this request on WhatsApp</span>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quotes List */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="size-4 text-royal dark:text-glow" />
                  <CardTitle className="font-heading text-lg font-bold text-foreground">
                    Quotes
                  </CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Review your project quotations and respond directly when ready.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {quotes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-xs sm:text-sm text-muted-foreground">
                    No quotes have been shared for this request yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quotes.map((quote, index) => {
                      const qStatus = (quote.status ?? "sent").toLowerCase();
                      const qBadge = QUOTE_STATUS_BADGES[qStatus] ?? {
                        label: qStatus.charAt(0).toUpperCase() + qStatus.slice(1),
                        className: "bg-muted text-muted-foreground border-border",
                      };
                      const quoteToken = quote.approval_token || quote.token || "";

                      return (
                        <div
                          key={quote.id ?? quote.quote_number ?? index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-sm text-foreground">
                                {quote.quote_number || `Quote #${index + 1}`}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn("text-[11px] font-semibold", qBadge.className)}
                              >
                                {qBadge.label}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">
                                {formatMoney(quote.total, quote.currency)}
                              </span>
                              <span>Valid until {formatDate(quote.valid_until)}</span>
                            </div>
                          </div>

                          {quoteToken && (
                            <Button
                              asChild
                              size="sm"
                              className="self-start sm:self-auto rounded-xl bg-brand-gradient text-white hover:opacity-90 text-xs"
                            >
                              <Link to="/quote/$token" params={{ token: quoteToken }}>
                                <span>View quote</span>
                                <ArrowUpRight className="size-3.5 ml-1.5" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
