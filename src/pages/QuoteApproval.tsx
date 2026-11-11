import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Printer,
  Calendar,
  MessageCircle,
  LoaderCircle,
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

interface QuoteItem {
  description: string;
  qty: number | string;
  unit_price: number | string;
}

interface QuotePayload {
  quote_number?: string | null;
  status?: "sent" | "accepted" | "declined" | string | null;
  currency?: string | null;
  subtotal?: number | null;
  tax_percent?: number | null;
  total?: number | null;
  valid_until?: string | null;
  expired?: boolean | null;
  terms?: string | null;
  scope?: string | null;
  timeline_days?: number | null;
  customer_name?: string | null;
  request_code?: string | null;
  responded_at?: string | null;
  items?: QuoteItem[] | null;
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

interface QuoteApprovalProps {
  token: string;
}

export function QuoteApproval({ token }: QuoteApprovalProps) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuotePayload | null>(null);

  // Decision note (max 1000 characters)
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const { data, error: rpcError } = await supabase.rpc("get_quote", {
        t: token,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      // Check for null result
      if (!data) {
        setNotFound(true);
        setQuote(null);
        return;
      }

      const res = (Array.isArray(data) ? data[0] : data) as QuotePayload | null;
      if (!res || (!res.quote_number && !res.total && !res.status)) {
        setNotFound(true);
        setQuote(null);
        return;
      }

      setQuote(res);
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
        note: note.trim() || null,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      toast.success(decision === "accepted" ? "Quote approved successfully!" : "Quote declined.");
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
              Retrieving verified quotation details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Real Error State (network or RPC errors)
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

  // 3. Null result: Plain message "not found"
  if (notFound || (!loading && !quote)) {
    return (
      <div className="bg-background min-h-screen">
        <PageHeader title="Quote Not Found" />
        <div className="container max-w-lg mx-auto py-16 px-4">
          <Card className="border-border bg-card shadow-sm text-center p-8 sm:p-10">
            <div className="size-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="size-7" />
            </div>
            <CardTitle className="text-xl font-bold font-heading text-foreground">
              Quote not found
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              We couldn&apos;t find a quote with that link. Check the link and try again, or contact
              us if you need assistance.
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

  // Financial values
  const currency = quote?.currency || "INR";
  const subtotal = Number(quote?.subtotal ?? 0);
  const taxPercent = Number(quote?.tax_percent ?? 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const total =
    quote?.total !== null && quote?.total !== undefined
      ? Number(quote.total)
      : subtotal + taxAmount;

  const items = Array.isArray(quote?.items) ? quote.items : [];
  const status = (quote?.status || "sent").toLowerCase();
  const isExpired = Boolean(quote?.expired);
  const canRespond = status === "sent" && !isExpired;

  const quoteNumber = quote?.quote_number || "NX-QUOTE";

  const waExpiredUrl = whatsappUrl(
    whatsappNumber,
    `Hi Nexora Technologies, I would like to inquire about my expired quote ${quoteNumber}.`,
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Page Header */}
      <div className="print:hidden">
        <PageHeader
          title={quoteNumber}
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Project Quotation" }]}
        />
      </div>

      <main className="container max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
        {/* Top Control Bar: Print button & Validity summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg font-bold text-foreground font-heading">
                Engineering Quotation
              </span>
              <Badge variant="outline" className="font-mono text-xs border-border">
                {quoteNumber}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5 flex-wrap">
              {quote?.timeline_days && (
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground/70" />
                  <span>
                    Estimated timeline:{" "}
                    <strong className="text-foreground">{quote.timeline_days} days</strong>
                  </span>
                </div>
              )}
              {quote?.valid_until && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground/70" />
                  <span>
                    Valid until:{" "}
                    <strong className="text-foreground">{formatDate(quote.valid_until)}</strong>
                  </span>
                </div>
              )}
            </div>
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

        {/* Status Plain Messages */}
        {/* 1. Accepted plain message */}
        {status === "accepted" && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-start sm:items-center gap-3.5 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">This quote has been approved.</h3>
              <p className="text-xs opacity-90 mt-0.5">
                {quote?.responded_at
                  ? `Approved on ${formatDateTime(quote.responded_at)}. Our engineering team is preparing your project kickoff.`
                  : "Thank you for approving this quote. We will proceed with onboarding."}
              </p>
            </div>
          </div>
        )}

        {/* 2. Declined plain message */}
        {status === "declined" && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 flex items-start sm:items-center gap-3.5 text-destructive">
            <XCircle className="size-6 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">This quote has been declined.</h3>
              <p className="text-xs opacity-90 mt-0.5">
                {quote?.responded_at
                  ? `Recorded on ${formatDateTime(quote.responded_at)}.`
                  : "You have declined this quotation."}
              </p>
            </div>
          </div>
        )}

        {/* 3. Expired plain message */}
        {isExpired && status !== "accepted" && status !== "declined" && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">This quote has expired.</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Please contact us to request an updated quote.
                </p>
              </div>
            </div>

            {waExpiredUrl && (
              <a
                href={waExpiredUrl}
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

        {/* Scope of Work Section (if present) */}
        {quote?.scope && (
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-semibold">Scope of Work</CardTitle>
              <CardDescription className="text-xs">
                Engineering milestones and project deliverables
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {quote.scope}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Items Table Card */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-semibold">Deliverables &amp; Pricing</CardTitle>
            <CardDescription className="text-xs">
              Itemized line deliverables with fixed unit pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border text-[11px]">
                    <TableHead className="w-12 text-center font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="w-24 text-right font-semibold">Qty</TableHead>
                    <TableHead className="w-32 text-right font-semibold">Unit Price</TableHead>
                    <TableHead className="w-36 text-right font-semibold pr-4">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-xs text-muted-foreground italic"
                      >
                        No itemized lines in this quote.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, idx) => {
                      const q = Number(item.qty) || 0;
                      const price = Number(item.unit_price) || 0;
                      const line = q * price;

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
          {/* Terms Card (if present) */}
          {quote?.terms ? (
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Terms &amp; Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {quote.terms}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div />
          )}

          {/* Financial Summary Card: Subtotal, Tax, Total */}
          <Card className="border-border bg-card shadow-xs">
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

        {/* Approval / Rejection Action Panel (Only if status is 'sent' and not expired) */}
        {canRespond && (
          <Card className="border-border bg-card shadow-md print:hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-semibold">
                Quote Approval &amp; Decision
              </CardTitle>
              <CardDescription className="text-xs">
                Approve or reject this quote. You may optionally include a note or scheduling
                comment.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Optional Note Textarea (max 1000 characters) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="decision-note"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
                  >
                    Optional Note (max 1000 characters)
                  </label>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {note.length}/1000
                  </span>
                </div>
                <Textarea
                  id="decision-note"
                  value={note}
                  maxLength={1000}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any specific requirements, kickoff availability, or feedback..."
                  rows={3}
                  className="text-xs leading-relaxed resize-y"
                />
              </div>

              {/* Action Buttons with Confirmation Dialogs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                {/* Reject Button with Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={submitting}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs h-9 gap-1.5"
                    >
                      <XCircle className="size-4" />
                      <span>Reject</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject this quote?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject quote {quoteNumber}? You may provide
                        feedback in the optional note.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => void handleDecision("declined")}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Confirm Rejection
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Approve Button with Dialog */}
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
                      <span>Approve</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve this quote?</AlertDialogTitle>
                      <AlertDialogDescription>
                        By approving quote {quoteNumber}, you confirm your acceptance of the
                        deliverables, timeline, and total. Nexora Technologies will proceed with
                        project onboarding.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => void handleDecision("accepted")}
                        className="bg-brand-gradient text-white"
                      >
                        Confirm Approval
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

export default QuoteApproval;
