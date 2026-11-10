import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Check,
  FileText,
  Save,
  Send,
  Plus,
  Trash2,
  MessageCircle,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Receipt,
  Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { whatsappUrl } from "@/lib/whatsapp";
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
import { meta } from "@/components/nexora/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/quotes/$id")({
  head: () =>
    meta("Quote Editor | Admin", "Draft, adjust pricing, and send client project quotes."),
  component: AdminQuoteEditorPage,
});

interface RequestRelation {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  request_code?: string | null;
}

interface QuoteRecord {
  id: string;
  quote_number: string;
  request_id?: string | null;
  status: string;
  currency?: string | null;
  tax_percent?: number | null;
  valid_until?: string | null;
  terms?: string | null;
  subtotal?: number | null;
  tax?: number | null;
  tax_amount?: number | null;
  total?: number | null;
  approval_token?: string | null;
  token?: string | null;
  customer_response?: string | null;
  customer_note?: string | null;
  responded_at?: string | null;
  sent_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  requests?: RequestRelation | RequestRelation[] | null;
}

interface QuoteItemForm {
  id?: string;
  description: string;
  qty: number | string;
  unit_price: number | string;
}

// Zod validation schemas
const itemSchema = z.object({
  description: z.string().trim().min(1, "Description is required for all items"),
  qty: z.coerce.number().gt(0, "Quantity must be greater than 0"),
  unit_price: z.coerce.number().min(0, "Price must be 0 or more"),
});

const quoteSaveSchema = z.object({
  items: z.array(itemSchema).min(1, "At least one item is required"),
  tax_percent: z.coerce
    .number()
    .min(0, "Tax percent must be between 0 and 100")
    .max(100, "Tax percent must be between 0 and 100"),
  valid_until: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
});

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  sent: {
    label: "Sent",
    className: "bg-royal/10 text-royal dark:text-glow border-royal/20",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground border-border",
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

function AdminQuoteEditorPage() {
  const { id } = Route.useParams();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [items, setItems] = useState<QuoteItemForm[]>([]);
  const [savedItems, setSavedItems] = useState<QuoteItemForm[]>([]);

  // Form states
  const [taxPercent, setTaxPercent] = useState<number | string>(0);
  const [validUntil, setValidUntil] = useState<string>("");
  const [terms, setTerms] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch quote and items in parallel
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const [quoteRes, itemsRes] = await Promise.all([
        supabase
          .from("quotes")
          .select("*, requests(name, email, phone, request_code)")
          .eq("id", id)
          .maybeSingle(),
        supabase.from("quote_items").select("*").eq("quote_id", id).order("position"),
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

      const q = quoteRes.data as QuoteRecord;
      setQuote(q);
      setTaxPercent(q.tax_percent ?? 0);
      setValidUntil(q.valid_until ?? "");
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

  // Determine if draft form has unsaved changes
  const isDirty = useMemo(() => {
    if (!quote) return false;

    // Check tax, date, terms
    const savedTax = Number(quote.tax_percent ?? 0);
    const curTax = Number(taxPercent) || 0;
    if (savedTax !== curTax) return true;

    const savedDate = quote.valid_until ?? "";
    if (savedDate !== validUntil) return true;

    const savedTerms = (quote.terms ?? "").trim();
    if (savedTerms !== terms.trim()) return true;

    // Check items
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
  }, [quote, items, savedItems, taxPercent, validUntil, terms]);

  const isDraft = (quote?.status ?? "draft").toLowerCase() === "draft";
  const todayIso = new Date().toISOString().split("T")[0];

  // Items manipulation
  const addItem = () => {
    setItems((prev) => [...prev, { description: "", qty: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItemForm, val: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      const existing = copy[index];
      if (!existing) return prev;
      copy[index] = { ...existing, [field]: val };
      return copy;
    });
  };

  // Save Quote Items and Parameters
  const handleSave = async () => {
    // 1. Zod validation
    const parsed = quoteSaveSchema.safeParse({
      items,
      tax_percent: taxPercent,
      valid_until: validUntil || null,
      terms,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Validation failed";
      toast.error(msg);
      return;
    }

    setSaving(true);
    try {
      const formattedItems = items.map((it) => ({
        description: it.description.trim(),
        qty: Number(it.qty),
        unit_price: Number(it.unit_price),
      }));

      // Call RPC save_quote_items
      const { error: rpcError } = await supabase.rpc("save_quote_items", {
        qid: id,
        items: formattedItems,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      // Update quote metadata (tax_percent, valid_until, terms)
      const { error: quoteUpdateError } = await supabase
        .from("quotes")
        .update({
          tax_percent: Number(taxPercent),
          valid_until: validUntil || null,
          terms: terms.trim(),
        })
        .eq("id", id);

      if (quoteUpdateError) {
        throw new Error(quoteUpdateError.message);
      }

      toast.success("Quote items and terms saved successfully");
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save quote";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Mark As Sent Handler
  const handleMarkAsSent = async () => {
    if (!isDraft || items.length === 0 || isDirty) return;
    setMarkingSent(true);
    try {
      const { error: sentError } = await supabase
        .from("quotes")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (sentError) {
        throw new Error(sentError.message);
      }

      toast.success("Quote marked as sent to customer");
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mark quote as sent";
      toast.error(msg);
    } finally {
      setMarkingSent(false);
    }
  };

  // Copy customer link
  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Customer quote link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
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
          <HelpCircle className="size-12 text-muted-foreground/60 mx-auto mb-3" />
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

  // Database-backed verified totals
  const subtotal = quote.subtotal ?? 0;
  const taxAmount = quote.tax_amount ?? quote.tax ?? 0;
  const total = quote.total ?? subtotal + taxAmount;
  const currency = quote.currency || "INR";

  // Share links
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const approvalToken = quote.approval_token || quote.token || "";
  const customerLink = `${origin}/quote/${approvalToken}`;

  const waUrl = customerPhone
    ? whatsappUrl(
        customerPhone,
        `Hi ${customerName}, your quote ${quote.quote_number} from Nexora Technologies is ready: ${customerLink}`,
      )
    : null;

  const currentStatus = (quote.status ?? "draft").toLowerCase();
  const statusBadgeConfig = STATUS_BADGES[currentStatus] ?? {
    label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
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
              {quote.quote_number}
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
                  <Send className="size-3.5 text-muted-foreground/70" />
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

      {/* Non-Draft Share Card & Customer Feedback */}
      {!isDraft && (
        <div className="space-y-6">
          {/* Share Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-gradient text-white">
                  <Share2 className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Customer Quote Access</CardTitle>
                  <CardDescription className="text-xs">
                    Secure link for client review, approval, or change request
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-foreground break-all select-all">
                  {customerLink}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleCopyLink(customerLink)}
                    className="gap-1.5 text-xs h-9 border-border"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>{copied ? "Copied" : "Copy link"}</span>
                  </Button>

                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Send on WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Response Card (when present) */}
          {(quote.customer_response || quote.customer_note || quote.responded_at) && (
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-royal/10 text-royal dark:text-glow">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Customer Response</CardTitle>
                    <CardDescription className="text-xs">
                      Client feedback and approval status
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quote.customer_response && (
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Response Status
                      </span>
                      <span className="mt-1 font-semibold text-foreground capitalize block">
                        {quote.customer_response.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}

                  {quote.responded_at && (
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Responded At
                      </span>
                      <span className="mt-1 font-medium text-foreground block">
                        {formatDateTime(quote.responded_at)}
                      </span>
                    </div>
                  )}
                </div>

                {quote.customer_note && (
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Customer Note
                    </span>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {quote.customer_note}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Section: Items Table */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Quote Items</CardTitle>
            <CardDescription className="text-xs">
              {isDraft
                ? "Define deliverables, engineering milestones, and unit rates."
                : "Locked quote items and pricing breakdown."}
            </CardDescription>
          </div>

          {isDraft && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="gap-1.5 text-xs h-8 border-border self-start sm:self-auto"
            >
              <Plus className="size-3.5" />
              <span>Add item</span>
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border">
                  <TableHead className="w-12 text-center text-xs font-semibold">#</TableHead>
                  <TableHead className="text-xs font-semibold">Description</TableHead>
                  <TableHead className="w-24 text-right text-xs font-semibold">Qty</TableHead>
                  <TableHead className="w-36 text-right text-xs font-semibold">
                    Unit Price
                  </TableHead>
                  <TableHead className="w-36 text-right text-xs font-semibold">
                    Line Total
                  </TableHead>
                  {isDraft && (
                    <TableHead className="w-16 text-center text-xs font-semibold">Action</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isDraft ? 6 : 5}
                      className="py-8 text-center text-sm text-muted-foreground italic"
                    >
                      No items added yet. {isDraft ? 'Click "Add item" to start.' : ""}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => {
                    const qNum = Number(item.qty) || 0;
                    const pNum = Number(item.unit_price) || 0;
                    const lineTotal = qNum * pNum;

                    return (
                      <TableRow key={index} className="border-b border-border hover:bg-muted/20">
                        {/* Index */}
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {index + 1}
                        </TableCell>

                        {/* Description */}
                        <TableCell>
                          {isDraft ? (
                            <Input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, "description", e.target.value)}
                              placeholder="e.g. Embedded Firmware Development &amp; Hardware Testing"
                              className="h-8 text-xs bg-transparent"
                            />
                          ) : (
                            <span className="text-xs font-medium text-foreground">
                              {item.description}
                            </span>
                          )}
                        </TableCell>

                        {/* Qty */}
                        <TableCell className="text-right">
                          {isDraft ? (
                            <Input
                              type="number"
                              min={1}
                              step={1}
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
                        <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                          {formatMoney(lineTotal, currency)}
                        </TableCell>

                        {/* Remove Action */}
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

      {/* Two Column Section: Terms & Dates on Left, Totals & Save Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tax, Valid Until & Terms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Terms &amp; Parameters</CardTitle>
              <CardDescription className="text-xs">
                Validity window, tax assessment, and scope payment terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tax Percent */}
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
                      {validUntil ? formatDate(validUntil) : "No expiration set"}
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
                    rows={5}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="e.g. 50% advance before hardware component sourcing, 50% upon demo prototype completion. Includes 30 days post-delivery documentation and support."
                    className="text-xs leading-relaxed resize-y"
                  />
                ) : (
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 text-xs text-foreground whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {terms || "Standard Nexora engineering prototyping terms apply."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Verified Database Totals & Actions */}
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-royal/10 text-royal dark:text-glow">
                  <Receipt className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Quote Summary</CardTitle>
                  <CardDescription className="text-xs">Database-calculated totals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-xs divide-y divide-border/60">
                {/* Subtotal */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>

                {/* Tax Amount */}
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-muted-foreground">
                    Tax ({Number(quote.tax_percent ?? taxPercent) || 0}%)
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatMoney(taxAmount, currency)}
                  </span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 text-sm">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-mono text-base font-extrabold text-foreground">
                    {formatMoney(total, currency)}
                  </span>
                </div>
              </div>

              {/* Draft Actions: Save & Mark As Sent */}
              {isDraft && (
                <div className="space-y-3 pt-4 border-t border-border">
                  {/* Save Button */}
                  <Button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="w-full gap-2 text-xs h-9 bg-brand-gradient text-white hover:opacity-90"
                  >
                    {saving ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    <span>{saving ? "Saving changes..." : "Save Quote"}</span>
                  </Button>

                  {/* Mark As Sent Button with Confirm Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={items.length === 0 || isDirty || saving || markingSent}
                        className="w-full gap-2 text-xs h-9 border-royal/30 text-royal hover:bg-royal/10 dark:text-glow"
                      >
                        {markingSent ? (
                          <LoaderCircle className="size-3.5 animate-spin" />
                        ) : (
                          <Send className="size-3.5" />
                        )}
                        <span>Mark as sent</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark Quote as Sent?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will lock the quote items from further direct editing and activate
                          the customer&apos;s approval link.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void handleMarkAsSent()}
                          className="bg-brand-gradient text-white"
                        >
                          Confirm &amp; Send
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Dirty State Warning */}
                  {isDirty && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center">
                      Save your changes first before marking as sent.
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
  );
}
