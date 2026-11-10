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
  ExternalLink,
  ShieldAlert,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface QuoteRecord {
  id: string;
  quote_number?: string | null;
  request_id?: string | null;
  version?: number | null;
  scope?: string | null;
  total?: number | null;
  currency?: string | null;
  timeline_days?: number | null;
  valid_until?: string | null;
  status: string;
  token_hash?: string | null;
  customer_comment?: string | null;
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

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Send quote success modal state
  const [sentToken, setSentToken] = useState<string | null>(null);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
        supabase
          .from("quote_items")
          .select("*")
          .eq("quote_id", id)
          .order("id", { ascending: true }),
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
      setScope(q.scope ?? "");
      setTimelineDays(q.timeline_days ?? "");
      setValidUntil(q.valid_until ?? "");

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

  // Live total computed in UI only
  const liveTotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const q = Number(it.qty) || 0;
      const p = Number(it.unit_price) || 0;
      return sum + q * p;
    }, 0);
  }, [items]);

  // Determine if draft form has unsaved changes
  const isDirty = useMemo(() => {
    if (!quote) return false;

    const savedScope = (quote.scope ?? "").trim();
    if (savedScope !== scope.trim()) return true;

    const savedTimeline = quote.timeline_days ? String(quote.timeline_days) : "";
    const curTimeline = timelineDays ? String(timelineDays) : "";
    if (savedTimeline !== curTimeline) return true;

    const savedDate = quote.valid_until ?? "";
    if (savedDate !== validUntil) return true;

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
  }, [quote, items, savedItems, scope, timelineDays, validUntil]);

  const isDraft = (quote?.status ?? "draft").toLowerCase() === "draft";
  const todayIso = new Date().toISOString().split("T")[0] ?? "";

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

  // Save handler: writes ONLY scope, timeline_days, valid_until to quotes, and items to quote_items
  // Never writes total, token_hash, or status directly from the browser!
  const handleSave = async () => {
    // Basic validation
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
      // 1. Update quotes table (NEVER write total, token_hash, or status!)
      const { error: quoteUpdateError } = await supabase
        .from("quotes")
        .update({
          scope: scope.trim() || null,
          timeline_days: timelineDays ? Number(timelineDays) : null,
          valid_until: validUntil || null,
        })
        .eq("id", id);

      if (quoteUpdateError) {
        throw new Error(quoteUpdateError.message);
      }

      // 2. Replace quote_items
      const { error: delError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", id);

      if (delError) {
        throw new Error(delError.message);
      }

      if (items.length > 0) {
        const formattedItems = items.map((it) => ({
          quote_id: id,
          description: it.description.trim(),
          qty: Number(it.qty) || 1,
          unit_price: Number(it.unit_price) || 0,
        }));

        const { error: insError } = await supabase
          .from("quote_items")
          .insert(formattedItems);

        if (insError) {
          throw new Error(insError.message);
        }
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
      const { data: rawToken, error: rpcError } = await supabase.rpc("send_quote", {
        q: id,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (!rawToken || typeof rawToken !== "string") {
        throw new Error("Did not receive secure approval token from server.");
      }

      setSentToken(rawToken);
      setTokenDialogOpen(true);
      toast.success("Quote sent! Customer approval link generated.");
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send quote.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const approvalLink = sentToken ? `${origin}/quote/${sentToken}` : "";

  const handleCopyLink = async () => {
    if (!approvalLink) return;
    try {
      await navigator.clipboard.writeText(approvalLink);
      setCopiedLink(true);
      toast.success("Link copied to clipboard");
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
          <ShieldAlert className="size-12 text-muted-foreground/60 mx-auto mb-3" />
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

  const quoteNumber =
    quote.quote_number || `NX-QUOTE-${quote.id.slice(0, 8).toUpperCase()}`;
  const currency = quote.currency || "INR";

  const currentStatus = (quote.status ?? "draft").toLowerCase();
  const statusBadgeConfig = STATUS_BADGES[currentStatus] ?? {
    label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
    className: "bg-muted text-muted-foreground border-border",
  };

  const waSendUrl =
    customerPhone && approvalLink
      ? whatsappUrl(
          customerPhone,
          `Hi ${customerName}, your quote ${quoteNumber} from Nexora Technologies is ready for review: ${approvalLink}`,
        )
      : null;

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
              {quote.version && quote.version > 1 && (
                <Badge variant="secondary" className="text-xs">
                  v{quote.version}
                </Badge>
              )}
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

        {/* Customer Response Callout if approved or rejected */}
        {quote.responded_at && (
          <Card
            className={cn(
              "border shadow-xs",
              currentStatus === "approved"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-destructive/30 bg-destructive/5",
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {currentStatus === "approved" ? (
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )}
                <CardTitle className="text-sm font-semibold">
                  Customer Decision:{" "}
                  <span className="capitalize">{currentStatus}</span> on{" "}
                  {formatDateTime(quote.responded_at)}
                </CardTitle>
              </div>
            </CardHeader>
            {quote.customer_comment && (
              <CardContent>
                <div className="text-xs font-medium text-foreground bg-background/50 rounded-lg p-3 border border-border/40">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                    Customer Comment
                  </span>
                  &ldquo;{quote.customer_comment}&rdquo;
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
                  Itemized scope breakdown with quantities and unit prices
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
                    <TableHead className="w-36 text-right font-semibold pr-4">
                      Line Total
                    </TableHead>
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
                        No items added yet. Click &ldquo;Add line item&rdquo; to begin.
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

        {/* Two Column Grid: Parameters on Left & Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scope, Timeline Days & Valid Until */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Scope &amp; Timeline</CardTitle>
                <CardDescription className="text-xs">
                  Engineering specifications, turnaround duration, and quote validity
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
                      rows={5}
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      placeholder="e.g. Design 4-layer PCB for STM32WB55, firmware driver implementation, 2 working prototypes with 3D enclosure."
                      className="text-xs leading-relaxed resize-y"
                    />
                  ) : (
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 text-xs text-foreground whitespace-pre-wrap leading-relaxed min-h-[100px]">
                      {scope || "No specific scope text provided."}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Timeline Days */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Timeline (Days)
                    </label>
                    {isDraft ? (
                      <Input
                        type="number"
                        min={1}
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
                        {validUntil ? formatDate(validUntil) : "14 days from issue"}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Calculated Total & Actions */}
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
                      {isDraft ? "Live calculated in UI" : "Verified database total"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2.5 text-xs divide-y divide-border/60">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-muted-foreground">Items Count</span>
                    <span className="font-mono font-semibold text-foreground">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {timelineDays && (
                    <div className="flex items-center justify-between pt-2.5">
                      <span className="text-muted-foreground">Est. Timeline</span>
                      <span className="font-mono font-semibold text-foreground">
                        {timelineDays} days
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 text-sm">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-mono text-base font-extrabold text-foreground">
                      {formatMoney(isDraft ? liveTotal : (quote.total ?? liveTotal), currency)}
                    </span>
                  </div>
                </div>

                {isDraft && (
                  <p className="text-[11px] text-muted-foreground italic">
                    Note: Total is verified &amp; locked on the server when sending.
                  </p>
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
                            This will lock the quote total, generate the one-time secure approval
                            link, and mark the quote status as &ldquo;sent&rdquo;.
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

        {/* Dialog showing generated one-time link when quote is sent */}
        <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="size-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center mb-2">
                <Share2 className="size-5" />
              </div>
              <DialogTitle>Quote Link Generated</DialogTitle>
              <DialogDescription>
                Share this secure approval link with the customer.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
                <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-bold">This link is shown only once.</span>
                  <p className="mt-0.5 opacity-90">
                    Copy and share this URL immediately. For security, only the cryptographic hash is
                    stored in the database.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-foreground break-all select-all">
                {approvalLink}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  className="flex-1 gap-1.5 text-xs h-9 bg-brand-gradient text-white"
                >
                  {copiedLink ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{copiedLink ? "Copied to clipboard!" : "Copy link"}</span>
                </Button>

                {waSendUrl && (
                  <a
                    href={waSendUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="size-4" />
                    <span>Send on WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTokenDialogOpen(false)}
                className="text-xs h-8 border-border"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireRole>
  );
}

export default QuoteEditor;

