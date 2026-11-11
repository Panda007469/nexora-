import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Check,
  Save,
  Send,
  Plus,
  Trash2,
  MessageCircle,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Receipt,
  Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { whatsappUrl } from "@/lib/whatsapp";
import { RequireRole } from "@/components/auth/RequireRole";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";

interface RequestRelation {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  request_code?: string | null;
}

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

interface QuoteRecord {
  id: string;
  request_id?: string | null;
  quote_number?: string | null;
  approval_token?: string | null;
  status: QuoteStatus;
  currency?: string | null;
  subtotal?: number | null;
  tax_percent?: number | null;
  total?: number | null;
  valid_until?: string | null;
  terms?: string | null;
  scope?: string | null;
  timeline_days?: number | null;
  customer_note?: string | null;
  sent_at?: string | null;
  responded_at?: string | null;
  created_at?: string | null;
  requests?: RequestRelation | RequestRelation[] | null;
}

export interface QuoteItemForm {
  id?: string;
  description: string;
  qty: number | string;
  unit_price: number | string;
}

const STATUS_BADGES: Record<QuoteStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
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

interface QuoteEditorProps {
  id: string;
}

export function QuoteEditor({ id }: QuoteEditorProps) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [items, setItems] = useState<QuoteItemForm[]>([]);
  const [savedItems, setSavedItems] = useState<QuoteItemForm[]>([]);

  // Form states
  const [scope, setScope] = useState<string>("");
  const [timelineDays, setTimelineDays] = useState<number | string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [taxPercent, setTaxPercent] = useState<number | string>(0);
  const [terms, setTerms] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch quote and items in parallel from live database schema
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const [quoteRes, itemsRes] = await Promise.all([
        supabase
          .from("quotes")
          .select(
            "id, request_id, quote_number, approval_token, status, currency, subtotal, tax_percent, total, valid_until, terms, scope, timeline_days, customer_note, sent_at, responded_at, created_at, requests(name, email, phone, request_code)",
          )
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("quote_items")
          .select("id, quote_id, description, qty, unit_price, position")
          .eq("quote_id", id)
          .order("position", { ascending: true }),
      ]);

      if (quoteRes.error) {
        throw new Error(quoteRes.error.message);
      }
      if (!quoteRes.data) {
        setNotFound(true);
        setQuote(null);
        return;
      }

      if (itemsRes.error) {
        throw new Error(itemsRes.error.message);
      }

      const q = quoteRes.data as unknown as QuoteRecord;
      setQuote(q);
      setScope(q.scope ?? "");
      setTimelineDays(q.timeline_days ?? "");
      setValidUntil(q.valid_until ?? "");
      setTaxPercent(q.tax_percent ?? 0);
      setTerms(q.terms ?? "");

      const loadedItems: QuoteItemForm[] = (itemsRes.data || []).map((it) => ({
        id: it.id,
        description: it.description ?? "",
        qty: it.qty ?? 1,
        unit_price: it.unit_price ?? 0,
      }));

      setItems(loadedItems);
      setSavedItems(loadedItems);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load quote details.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Live estimate totals while typing
  const liveSubtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const q = Number(it.qty) || 0;
      const p = Number(it.unit_price) || 0;
      return sum + q * p;
    }, 0);
  }, [items]);

  const liveTax = useMemo(() => {
    const rate = Number(taxPercent) || 0;
    return (liveSubtotal * rate) / 100;
  }, [liveSubtotal, taxPercent]);

  const liveEstimateTotal = useMemo(() => {
    return liveSubtotal + liveTax;
  }, [liveSubtotal, liveTax]);

  // Determine if draft form has unsaved changes
  const isDirty = useMemo(() => {
    if (!quote) return false;

    if ((quote.scope ?? "").trim() !== scope.trim()) return true;
    if (String(quote.timeline_days ?? "") !== String(timelineDays)) return true;
    if ((quote.valid_until ?? "") !== validUntil) return true;
    if (Number(quote.tax_percent ?? 0) !== Number(taxPercent)) return true;
    if ((quote.terms ?? "").trim() !== terms.trim()) return true;

    if (items.length !== savedItems.length) return true;
    for (let i = 0; i < items.length; i++) {
      const cur = items[i];
      const saved = savedItems[i];
      if (!cur || !saved) return true;
      if (cur.description.trim() !== (saved.description ?? "").trim()) return true;
      if (Number(cur.qty) !== Number(saved.qty)) return true;
      if (Number(cur.unit_price) !== Number(saved.unit_price)) return true;
    }

    return false;
  }, [quote, items, savedItems, scope, timelineDays, validUntil, taxPercent, terms]);

  const isDraft = (quote?.status ?? "draft") === "draft";
  const todayIso = new Date().toISOString().split("T")[0] ?? "";

  // Items manipulation (only allowed in draft)
  const addItem = () => {
    if (!isDraft) return;
    setItems((prev) => [...prev, { description: "", qty: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (!isDraft) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItemForm, val: string | number) => {
    if (!isDraft) return;
    setItems((prev) => {
      const copy = [...prev];
      const existing = copy[index];
      if (!existing) return prev;
      copy[index] = { ...existing, [field]: val };
      return copy;
    });
  };

  // Save handler: writes scope, timeline_days, valid_until, tax_percent, terms, and calls save_quote_items
  // NEVER writes status, total, subtotal, or approval_token from the browser!
  const handleSave = async () => {
    if (!isDraft) return;

    // Validate tax percent
    const numTax = Number(taxPercent);
    if (isNaN(numTax) || numTax < 0 || numTax > 100) {
      toast.error("Tax percent must be between 0 and 100.");
      return;
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || !it.description.trim()) {
        toast.error(`Item #${i + 1} requires a description.`);
        return;
      }
      if (Number(it.qty) <= 0) {
        toast.error(`Item #${i + 1} quantity must be greater than 0.`);
        return;
      }
      if (Number(it.unit_price) < 0) {
        toast.error(`Item #${i + 1} unit price cannot be negative.`);
        return;
      }
    }

    setSaving(true);
    try {
      // 1. Update quotes table (NEVER write status, total, subtotal, or approval_token!)
      const { error: quoteUpdateError } = await supabase
        .from("quotes")
        .update({
          scope: scope.trim() || null,
          timeline_days: timelineDays ? Number(timelineDays) : null,
          valid_until: validUntil || null,
          tax_percent: numTax,
          terms: terms.trim() || null,
        })
        .eq("id", id);

      if (quoteUpdateError) {
        throw new Error(quoteUpdateError.message);
      }

      // 2. Save items via RPC save_quote_items
      const formattedItems = items.map((it) => ({
        description: it.description.trim(),
        qty: Number(it.qty) || 1,
        unit_price: Number(it.unit_price) || 0,
      }));

      const { error: rpcError } = await supabase.rpc("save_quote_items", {
        qid: id,
        items: formattedItems,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      toast.success("Quote saved successfully");
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save quote.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Send quote handler: calls supabase.rpc('send_quote', { q: id })
  const handleSendQuote = async () => {
    if (!isDraft) return;
    if (items.length === 0) {
      toast.error("Add at least one item before sending.");
      return;
    }
    if (isDirty) {
      toast.error("Please save your changes before sending the quote.");
      return;
    }

    setSending(true);
    try {
      const { data, error: sendError } = await supabase.rpc("send_quote", {
        q: id,
      });

      if (sendError) {
        throw new Error(sendError.message);
      }

      // data contains { approval_token, quote_number }
      toast.success("Quote sent successfully!");
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send quote.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // Customer approval link derived from live database approval_token
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const customerLink = quote?.approval_token ? `${origin}/quote/${quote.approval_token}` : "";

  const handleCopyLink = async () => {
    if (!customerLink) return;
    try {
      await navigator.clipboard.writeText(customerLink);
      setCopiedLink(true);
      toast.success("Customer quote link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // 1. Loading State
  if (loading && !quote) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-36 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  // 2. Error State
  if (error && !quote) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
        <Link
          to="/admin/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to requests
        </Link>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="size-10 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Failed to load quote</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-5">{error}</p>
          <Button onClick={() => void fetchData()} variant="outline" className="gap-2">
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // 3. Not Found State
  if (notFound || !quote) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
        <Link
          to="/admin/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to requests
        </Link>
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
          <AlertCircle className="size-12 text-muted-foreground/60 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-foreground">Quote Not Found</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            The quote with ID <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{id}</code>{" "}
            could not be found.
          </p>
          <div className="mt-6">
            <Button asChild variant="default">
              <Link to="/admin">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Resolved related request data
  const req = Array.isArray(quote.requests) ? quote.requests[0] : quote.requests;
  const requestCode =
    req?.request_code || (quote.request_id ? `REQ-${quote.request_id.slice(0, 8)}` : "—");
  const customerName = req?.name || "Client";
  const customerPhone = req?.phone || "";

  const quoteNumber = quote.quote_number || `NX-QUOTE-${quote.id.slice(0, 8).toUpperCase()}`;
  const currency = quote.currency || "INR";

  const currentStatus = (quote.status ?? "draft") as QuoteStatus;
  const statusBadgeConfig = STATUS_BADGES[currentStatus] ?? {
    label: currentStatus,
    className: "bg-muted text-muted-foreground border-border",
  };

  // WhatsApp share link for when status is not draft
  const waSendUrl =
    customerPhone && customerLink
      ? whatsappUrl(
          customerPhone,
          `Hi ${customerName}, your quote ${quoteNumber} from Nexora Technologies is ready: ${customerLink}`,
        )
      : null;

  // Refetched database numbers
  const dbSubtotal = Number(quote.subtotal) || 0;
  const dbTaxPercent = Number(quote.tax_percent) || 0;
  const dbTax = (dbSubtotal * dbTaxPercent) / 100;
  const dbTotal =
    quote.total !== null && quote.total !== undefined ? Number(quote.total) : dbSubtotal + dbTax;

  return (
    <RequireRole role="admin">
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Top Bar: Back Link */}
        <div>
          {quote.request_id ? (
            <Link
              to="/admin/requests/$id"
              params={{ id: quote.request_id }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to request</span>
            </Link>
          ) : (
            <Link
              to="/admin/requests"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to requests</span>
            </Link>
          )}
        </div>

        {/* Header: Quote Number, Status, Request link, Dates */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
                {quoteNumber}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-semibold px-2.5 py-0.5 capitalize",
                  statusBadgeConfig.className,
                )}
              >
                {statusBadgeConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
              {quote.request_id ? (
                <div className="flex items-center gap-1.5">
                  <span>Associated Request:</span>
                  <Link
                    to="/admin/requests/$id"
                    params={{ id: quote.request_id }}
                    className="font-mono font-semibold text-royal dark:text-glow hover:underline"
                  >
                    {requestCode}
                  </Link>
                </div>
              ) : (
                <span>Request: {requestCode}</span>
              )}
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground/70" />
                <span>Created {formatDate(quote.created_at)}</span>
              </div>
              {quote.sent_at && (
                <>
                  <span className="text-border">•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground/70" />
                    <span>Sent {formatDateTime(quote.sent_at)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Refresh button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchData()}
              disabled={loading}
              className="gap-2 text-xs h-8"
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Non-Draft Customer Link Card with Copy & WhatsApp buttons */}
        {!isDraft && customerLink && (
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-gradient text-white">
                  <Share2 className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Customer Quote Link</CardTitle>
                  <CardDescription className="text-xs">
                    Share this verified link for client review, approval, or decline
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-foreground break-all select-all">
                  {customerLink}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleCopyLink()}
                    className="gap-1.5 text-xs h-9 border-border"
                  >
                    {copiedLink ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>{copiedLink ? "Copied" : "Copy link"}</span>
                  </Button>

                  {waSendUrl && (
                    <a
                      href={waSendUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity"
                    >
                      <MessageCircle className="size-4" />
                      <span>Send on WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Feedback Note if accepted or declined */}
        {(currentStatus === "accepted" || currentStatus === "declined") && (
          <Card
            className={cn(
              "border shadow-xs",
              currentStatus === "accepted"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-destructive/30 bg-destructive/5",
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {currentStatus === "accepted" ? (
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )}
                <CardTitle className="text-sm font-semibold">
                  Customer Decision: <span className="capitalize">{currentStatus}</span>
                  {quote.responded_at && ` on ${formatDateTime(quote.responded_at)}`}
                </CardTitle>
              </div>
            </CardHeader>
            {quote.customer_note && (
              <CardContent>
                <div className="text-xs font-medium text-foreground bg-background/50 rounded-lg p-3 border border-border/40">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                    Customer Note
                  </span>
                  &ldquo;{quote.customer_note}&rdquo;
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Line Items Card */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-royal/10 text-royal dark:text-glow">
                <Receipt className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Line Items &amp; Pricing</CardTitle>
                <CardDescription className="text-xs">
                  {isDraft
                    ? "Editable line items (description, quantity, unit price)"
                    : "Read-only quote deliverables"}
                </CardDescription>
              </div>
            </div>

            {isDraft && (
              <Button
                type="button"
                size="sm"
                onClick={addItem}
                variant="outline"
                className="gap-1.5 text-xs h-8 border-border self-start sm:self-auto"
              >
                <Plus className="size-3.5" />
                <span>Add line item</span>
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border text-[11px]">
                    <TableHead className="w-12 text-center font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="w-24 text-right font-semibold">Qty</TableHead>
                    <TableHead className="w-36 text-right font-semibold">
                      Unit Price ({currency})
                    </TableHead>
                    <TableHead className="w-36 text-right font-semibold pr-4">Line Total</TableHead>
                    {isDraft && <TableHead className="w-12 text-center"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isDraft ? 6 : 5}
                        className="py-8 text-center text-xs text-muted-foreground italic"
                      >
                        {isDraft
                          ? "No items added yet. Click “Add line item” to begin."
                          : "No itemized lines in this quote."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, index) => {
                      const q = Number(item.qty) || 0;
                      const price = Number(item.unit_price) || 0;
                      const lineTotal = q * price;

                      return (
                        <TableRow
                          key={item.id ?? index}
                          className="border-b border-border hover:bg-muted/10"
                        >
                          <TableCell className="text-center font-mono text-xs text-muted-foreground py-3">
                            {index + 1}
                          </TableCell>

                          {/* Description */}
                          <TableCell className="py-3">
                            {isDraft ? (
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(index, "description", e.target.value)}
                                placeholder="Deliverable / Milestone description..."
                                className="h-8 text-xs bg-transparent"
                              />
                            ) : (
                              <span className="text-xs font-medium text-foreground">
                                {item.description}
                              </span>
                            )}
                          </TableCell>

                          {/* Quantity */}
                          <TableCell className="text-right">
                            {isDraft ? (
                              <Input
                                type="number"
                                min={1}
                                step="any"
                                value={item.qty}
                                onChange={(e) => updateItem(index, "qty", e.target.value)}
                                className="h-8 text-xs text-right bg-transparent w-20 ml-auto"
                              />
                            ) : (
                              <span className="text-xs font-mono text-foreground">{item.qty}</span>
                            )}
                          </TableCell>

                          {/* Unit Price */}
                          <TableCell className="text-right">
                            {isDraft ? (
                              <Input
                                type="number"
                                min={0}
                                step="any"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                                className="h-8 text-xs text-right bg-transparent w-28 ml-auto"
                              />
                            ) : (
                              <span className="text-xs font-mono text-foreground">
                                {formatMoney(Number(item.unit_price), currency)}
                              </span>
                            )}
                          </TableCell>

                          {/* Line Total */}
                          <TableCell className="text-right font-mono text-xs font-semibold text-foreground pr-4">
                            {formatMoney(lineTotal, currency)}
                          </TableCell>

                          {/* Remove Action (Draft only) */}
                          {isDraft && (
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="size-3.5" />
                                <span className="sr-only">Remove item</span>
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Grid: Parameters on Left & Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scope, Timeline Days, Valid Until, Tax Percent, Terms */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Scope &amp; Parameters</CardTitle>
                <CardDescription className="text-xs">
                  Engineering scope, turnaround timeline, tax assessment, and terms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scope Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Scope of Work &amp; Deliverables
                  </label>
                  {isDraft ? (
                    <Textarea
                      rows={4}
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      placeholder="e.g. Design 4-layer PCB for STM32WB55, firmware driver implementation, 2 working prototypes with 3D enclosure."
                      className="text-xs leading-relaxed resize-y"
                    />
                  ) : (
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 text-xs text-foreground whitespace-pre-wrap leading-relaxed min-h-[80px]">
                      {scope || "No specific scope text provided."}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {/* Timeline Days */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Timeline (Days)
                    </label>
                    {isDraft ? (
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        value={timelineDays}
                        onChange={(e) => setTimelineDays(e.target.value)}
                        placeholder="e.g. 14"
                        className="text-xs h-9"
                      />
                    ) : (
                      <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs font-mono font-medium text-foreground">
                        {timelineDays ? `${timelineDays} days` : "Not specified"}
                      </div>
                    )}
                  </div>

                  {/* Valid Until Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Valid Until
                    </label>
                    {isDraft ? (
                      <Input
                        type="date"
                        min={todayIso}
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className="text-xs h-9"
                      />
                    ) : (
                      <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs font-medium text-foreground">
                        {validUntil ? formatDate(validUntil) : "No date set"}
                      </div>
                    )}
                  </div>

                  {/* Tax Percent (0 to 100) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Tax Percent (%)
                    </label>
                    {isDraft ? (
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(e.target.value)}
                        placeholder="e.g. 18"
                        className="text-xs h-9"
                      />
                    ) : (
                      <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs font-mono font-medium text-foreground">
                        {taxPercent}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms Textarea */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Terms &amp; Conditions
                  </label>
                  {isDraft ? (
                    <Textarea
                      rows={4}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      placeholder="e.g. 50% advance before hardware component sourcing, 50% upon demo prototype completion. Includes 30 days post-delivery documentation and support."
                      className="text-xs leading-relaxed resize-y"
                    />
                  ) : (
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 text-xs text-foreground whitespace-pre-wrap leading-relaxed min-h-[80px]">
                      {terms || "Standard Nexora engineering prototyping terms apply."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Database Totals & Live Estimate Summary */}
          <div className="space-y-6">
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-royal/10 text-royal dark:text-glow">
                    <Receipt className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Quote Summary</CardTitle>
                    <CardDescription className="text-xs">
                      {isDraft ? "Live typing estimate vs saved" : "Verified financial breakdown"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isDraft ? (
                  /* While typing in Draft: label as estimate */
                  <div className="space-y-2.5 text-xs divide-y divide-border/60">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground">Subtotal (estimate)</span>
                      <span className="font-mono font-semibold text-foreground">
                        {formatMoney(liveSubtotal, currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5">
                      <span className="text-muted-foreground">
                        Tax ({Number(taxPercent) || 0}%) (estimate)
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        {formatMoney(liveTax, currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 text-sm">
                      <span className="font-bold text-foreground">Total (estimate)</span>
                      <span className="font-mono text-base font-extrabold text-foreground">
                        {formatMoney(liveEstimateTotal, currency)}
                      </span>
                    </div>

                    {quote.subtotal !== null && quote.subtotal !== undefined && (
                      <div className="pt-3 text-[11px] text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Last saved subtotal:</span>
                          <span className="font-mono">{formatMoney(quote.subtotal, currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last saved total:</span>
                          <span className="font-mono font-medium">
                            {formatMoney(quote.total, currency)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Saved Database Totals when not in draft */
                  <div className="space-y-2.5 text-xs divide-y divide-border/60">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-mono font-semibold text-foreground">
                        {formatMoney(dbSubtotal, currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5">
                      <span className="text-muted-foreground">Tax ({dbTaxPercent}%)</span>
                      <span className="font-mono font-semibold text-foreground">
                        {formatMoney(dbTax, currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 text-sm">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-mono text-base font-extrabold text-foreground">
                        {formatMoney(dbTotal, currency)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Draft Actions: Save & Send Quote */}
                {isDraft && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    {/* Save Button */}
                    <Button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving || sending}
                      className="w-full gap-2 text-xs h-9 bg-brand-gradient text-white hover:opacity-90"
                    >
                      {saving ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Save className="size-3.5" />
                      )}
                      <span>{saving ? "Saving changes..." : "Save Quote"}</span>
                    </Button>

                    {/* Send Quote Button with AlertDialog Confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={items.length === 0 || isDirty || saving || sending}
                          className="w-full gap-2 text-xs h-9 border-royal/30 text-royal hover:bg-royal/10 dark:text-glow"
                        >
                          {sending ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                          ) : (
                            <Send className="size-3.5" />
                          )}
                          <span>Send quote</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Send Quote to Customer?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will activate the customer&apos;s quote approval link and lock
                            items from further direct editing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void handleSendQuote()}
                            className="bg-brand-gradient text-white"
                          >
                            Confirm &amp; Send
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {isDirty && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center">
                        Save your changes first before sending.
                      </p>
                    )}
                    {items.length === 0 && (
                      <p className="text-[11px] text-muted-foreground text-center">
                        Add at least one item to enable sending.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}

export default QuoteEditor;
