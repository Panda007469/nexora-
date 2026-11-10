import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Printer,
  MessageCircle,
  Calendar,
  FileText,
  User,
  Hash,
  LoaderCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { whatsappNumber } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quote/$token")({
  head: () => ({
    meta: [
      { title: "Project Quote | Nexora Technologies" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: CustomerQuotePage,
});

interface QuoteItem {
  id?: string;
  description: string;
  qty: number | string;
  unit_price: number | string;
  line_total?: number | string;
}

interface QuoteData {
  quote_number?: string;
  number?: string;
  customer_name?: string;
  name?: string;
  request_code?: string;
  code?: string;
  currency?: string;
  items?: QuoteItem[];
  quote_items?: QuoteItem[];
  subtotal?: number;
  tax_percent?: number;
  tax_rate?: number;
  tax_amount?: number;
  tax?: number;
  total?: number;
  valid_until?: string | null;
  terms?: string | null;
  status?: string | null;
  responded_at?: string | null;
  customer_response?: string | null;
  customer_note?: string | null;
  note?: string | null;
  created_at?: string | null;
}

function formatMoney(amount: number | null | undefined, currency = "INR") {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function CustomerQuotePage() {
  const { token } = Route.useParams();

  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteData | null>(null);

  // Decision state
  const [decisionNote, setDecisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thankYouState, setThankYouState] = useState<"accepted" | "declined" | null>(null);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInvalid(false);

    try {
      const { data, error: rpcError } = await supabase.rpc("get_quote", {
        t: token,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (!data) {
        setInvalid(true);
        setQuote(null);
        return;
      }

      const q = (Array.isArray(data) ? data[0] : data) as QuoteData;
      if (!q || (!q.quote_number && !q.number && !q.total)) {
        setInvalid(true);
        setQuote(null);
        return;
      }

      setQuote(q);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load quote details.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchQuote();
  }, [fetchQuote]);

  const handleDecision = async (decision: "accepted" | "declined") => {
    setSubmitting(true);
    try {
      const { error: rpcError } = await supabase.rpc("respond_quote", {
        t: token,
        decision,
        note: decisionNote.trim() || null,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      setThankYouState(decision);
      toast.success(
        decision === "accepted" ? "Quote accepted successfully" : "Quote declined successfully",
      );
      await fetchQuote();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit decision.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading State
  if (loading && !quote) {
    return (
      <div className="bg-background min-h-screen">
        <PageHeader title="Loading Quote..." />
        <div className="container max-w-4xl mx-auto py-16 px-4 space-y-6">
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <LoaderCircle className="size-10 animate-spin text-royal dark:text-glow mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              Retrieving verified quotation details from Nexora...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Invalid Quote Token State
  if (invalid || (!loading && !quote)) {
    return (
      <div className="bg-background min-h-screen">
        <PageHeader title="Invalid Quote Link" />
        <div className="container max-w-lg mx-auto py-16 px-4">
          <Card className="border-border bg-card shadow-sm text-center p-8 sm:p-10">
            <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="size-7" />
            </div>
            <CardTitle className="text-xl font-bold font-heading text-foreground">
              This quote link is not valid
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              The quotation reference link you entered does not exist or may have expired. Please
              verify the full link with your Nexora engineering representative.
            </CardDescription>
            <div className="pt-6">
              <Button asChild variant="outline" className="border-border text-xs h-9">
                <Link to="/">Return to Homepage</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (error && !quote) {
    return (
      <div className="bg-background min-h-screen">
        <PageHeader title="Unable to Load Quote" />
        <div className="container max-w-lg mx-auto py-16 px-4">
          <Card className="border-destructive/30 bg-destructive/5 text-center p-8">
            <AlertCircle className="size-10 text-destructive mx-auto mb-3" />
            <CardTitle className="text-lg font-bold text-foreground">Error Loading Quote</CardTitle>
            <p className="text-xs text-muted-foreground mt-2 mb-5">{error}</p>
            <Button
              onClick={() => void fetchQuote()}
              variant="outline"
              className="border-border text-xs gap-2"
            >
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Derived Quote Display Values
  const quoteNumber = quote?.quote_number || quote?.number || "NX-QUOTE";
  const customerName = quote?.customer_name || quote?.name || "Client";
  const requestCode = quote?.request_code || quote?.code || "";
  const currency = quote?.currency || "INR";

  const rawItems = quote?.items || quote?.quote_items || [];
  const subtotal = Number(quote?.subtotal ?? 0);
  const taxPercent = Number(quote?.tax_percent ?? quote?.tax_rate ?? 0);
  const taxAmount = Number(quote?.tax_amount ?? quote?.tax ?? 0);
  const total = Number(quote?.total ?? subtotal + taxAmount);
  const validUntil = quote?.valid_until || null;
  const terms = quote?.terms || "";

  const status = (quote?.status || "sent").toLowerCase();
  const respondedAt = quote?.responded_at || null;
  const customerNote = quote?.customer_note || quote?.note || null;

  // Expiration check
  const todayIso = new Date().toISOString().split("T")[0] ?? "";
  const isExpired = Boolean(
    status === "expired" || (validUntil && validUntil.slice(0, 10) < todayIso && status === "sent"),
  );

  const isSent = status === "sent" && !isExpired;
  const isAccepted = status === "accepted" || status === "approved" || thankYouState === "accepted";
  const isDeclined = status === "declined" || status === "rejected" || thankYouState === "declined";

  const waContactUrl = whatsappUrl(
    whatsappNumber,
    `Hi Nexora Technologies, I would like to inquire about my expired quote ${quoteNumber}.`,
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Page Header */}
      <div className="print:hidden">
        <PageHeader
          title={quoteNumber}
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: `Prepared for ${customerName}` },
            { label: requestCode ? `Request ${requestCode}` : "Quote" },
          ]}
        />
      </div>

      {/* Main Quote Container */}
      <main className="container max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
        {/* Print-Only Header Banner */}
        <div className="hidden print:block border-b-2 border-neutral-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold font-heading text-neutral-900 tracking-tight">
                NEXORA TECHNOLOGIES
              </h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                Embedded • VLSI • IoT Hardware &amp; Software Prototyping
              </p>
            </div>
            <div className="text-right">
              <span className="text-base font-mono font-bold text-neutral-900 block">
                {quoteNumber}
              </span>
              <span className="text-xs text-neutral-500">
                Generated: {formatDate(quote?.created_at || new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>

        {/* Top Control Bar: Prepared for, Request Code, Print button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Prepared for
              </span>
              <span className="text-base font-bold text-foreground font-heading">
                {customerName}
              </span>
              {requestCode && (
                <Badge variant="outline" className="font-mono text-[11px] border-border">
                  Request: {requestCode}
                </Badge>
              )}
            </div>

            {validUntil && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                <Calendar className="size-3.5 text-muted-foreground/70" />
                <span>
                  Valid until:{" "}
                  <strong className="text-foreground font-semibold">
                    {formatDate(validUntil)}
                  </strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-2 text-xs h-9 border-border"
            >
              <Printer className="size-4" />
              <span>Print Quote</span>
            </Button>
          </div>
        </div>

        {/* Status Callout Banners */}
        {/* 1. Accepted Banner */}
        {isAccepted && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-start sm:items-center gap-3.5 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-6 shrink-0 mt-0.5 sm:mt-0 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Quote Accepted</h3>
              <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-0.5">
                {respondedAt
                  ? `Recorded on ${formatDateTime(respondedAt)}. Our engineering team is preparing your project kickoff.`
                  : "Thank you for approving this quotation. We will be in touch shortly."}
              </p>
            </div>
          </div>
        )}

        {/* 2. Declined Banner */}
        {isDeclined && !isAccepted && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 flex items-start sm:items-center gap-3.5 text-destructive">
            <XCircle className="size-6 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Quote Declined</h3>
              <p className="text-xs opacity-90 mt-0.5">
                {respondedAt
                  ? `Recorded on ${formatDateTime(respondedAt)}.`
                  : "You have declined this quotation."}
              </p>
            </div>
          </div>
        )}

        {/* 3. Expired Banner */}
        {isExpired && !isAccepted && !isDeclined && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  This quote has expired. Please contact us
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reach out to request an extended validity date or revised project quote.
                </p>
              </div>
            </div>

            {waContactUrl && (
              <a
                href={waContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-opacity self-start sm:self-auto shrink-0 print:hidden"
              >
                <MessageCircle className="size-4" />
                <span>Contact on WhatsApp</span>
              </a>
            )}
          </div>
        )}

        {/* 4. Thank You Card (Post submission) */}
        {thankYouState && (
          <div className="rounded-2xl border border-royal/20 bg-royal/10 p-6 text-center space-y-2">
            <CheckCircle2 className="size-8 text-royal dark:text-glow mx-auto" />
            <h3 className="text-base font-bold text-foreground">Thank You for Your Response</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your feedback has been logged directly with Nexora engineering. We appreciate your
              time and partnership.
            </p>
          </div>
        )}

        {/* Items Table Card */}
        <Card className="border-border bg-card shadow-xs print:border-neutral-300 print:shadow-none">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-semibold">
              Scope Deliverables &amp; Pricing
            </CardTitle>
            <CardDescription className="text-xs">
              Milestone breakdown with fixed unit prices
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border text-[11px]">
                    <TableHead className="w-12 text-center font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="w-20 text-right font-semibold">Qty</TableHead>
                    <TableHead className="w-32 text-right font-semibold">Unit Price</TableHead>
                    <TableHead className="w-32 text-right font-semibold pr-4">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-xs text-muted-foreground italic"
                      >
                        No itemized lines in this quote.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rawItems.map((item, idx) => {
                      const q = Number(item.qty) || 0;
                      const price = Number(item.unit_price) || 0;
                      const line = Number(item.line_total ?? q * price);

                      return (
                        <TableRow key={idx} className="border-b border-border hover:bg-muted/10">
                          <TableCell className="text-center font-mono text-xs text-muted-foreground py-3">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="py-3 text-xs sm:text-sm font-medium text-foreground">
                            {item.description}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs sm:text-sm text-foreground py-3">
                            {q}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs sm:text-sm text-foreground py-3">
                            {formatMoney(price, currency)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs sm:text-sm font-semibold text-foreground py-3 pr-4">
                            {formatMoney(line, currency)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Totals & Terms Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Terms Card */}
          <Card className="border-border bg-card shadow-xs print:border-neutral-300 print:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Terms &amp; Milestone Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {terms ||
                  "Standard Nexora Technologies prototyping milestones and payment terms apply."}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Totals Card */}
          <Card className="border-border bg-card shadow-xs print:border-neutral-300 print:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-xs sm:text-sm divide-y divide-border/60">
                <div className="flex justify-between items-center pt-1">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-muted-foreground">Tax ({taxPercent}%)</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatMoney(taxAmount, currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 text-base">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-mono text-lg font-extrabold text-foreground">
                    {formatMoney(total, currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Note Display (if previously saved) */}
        {customerNote && (
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Feedback Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {customerNote}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Panel: Accept / Decline with Note (Only when status is 'sent' and NOT expired) */}
        {isSent && !thankYouState && (
          <Card className="border-border bg-card shadow-md print:hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-semibold">
                Quote Decision &amp; Approval
              </CardTitle>
              <CardDescription className="text-xs">
                Review deliverables and confirm your approval or decline below
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Optional Note Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="decision-note"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
                  >
                    Optional Note (max 1000 characters)
                  </label>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {decisionNote.length}/1000
                  </span>
                </div>
                <Textarea
                  id="decision-note"
                  value={decisionNote}
                  maxLength={1000}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder="Add any specific delivery requirements, scheduling notes, or feedback here..."
                  rows={3}
                  className="text-xs leading-relaxed resize-y"
                />
              </div>

              {/* Action Buttons with Confirm Dialogs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                {/* Decline Quote Button with Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={submitting}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs h-9 gap-1.5"
                    >
                      <XCircle className="size-4" />
                      <span>Decline quote</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Decline this quote?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to decline quote {quoteNumber}? You may provide
                        context or required adjustments in the optional note.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => void handleDecision("declined")}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Confirm Decline
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Accept Quote Button with Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={submitting}
                      className="bg-brand-gradient text-white hover:opacity-90 text-xs h-9 gap-1.5 shadow-sm"
                    >
                      {submitting ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      <span>Accept quote</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Accept this quote?</AlertDialogTitle>
                      <AlertDialogDescription>
                        By accepting quote {quoteNumber}, you confirm your approval of the scope
                        deliverables and payment terms. Nexora Technologies will proceed with
                        project onboarding.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => void handleDecision("accepted")}
                        className="bg-brand-gradient text-white"
                      >
                        Confirm Accept
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
