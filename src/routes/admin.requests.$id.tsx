import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Phone,
  Building2,
  MapPin,
  User,
  Cpu,
  Layers,
  FileText,
  Save,
  UserCheck,
  MessageCircle,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  Tag,
  CircleDollarSign,
  CheckCircle2,
  HelpCircle,
  Receipt,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { whatsappUrl, formatPhone } from "@/lib/whatsapp";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { meta } from "@/components/nexora/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/requests/$id")({
  head: () =>
    meta(
      "Request Details | Admin",
      "Inspect engineering scope, customer profile, and update project status.",
    ),
  component: AdminRequestDetailPage,
});

interface RequestRecord {
  id: string;
  request_code?: string | null;
  code?: string | null;
  name?: string | null;
  student_name?: string | null;
  email?: string | null;
  phone?: string | null;
  org?: string | null;
  college?: string | null;
  city?: string | null;
  customer_type?: string | null;
  service?: string | null;
  service_type?: string | null;
  idea?: string | null;
  description?: string | null;
  deadline?: string | null;
  budget?: string | null;
  tech_details?: unknown;
  technical_details?: unknown;
  deliverables?: unknown;
  status?: string | null;
  assigned_to?: string | null;
  internal_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under review" },
  { value: "consultation", label: "Consultation" },
  { value: "qualified", label: "Qualified" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  new: {
    label: "New",
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
    label: "Qualified",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground border-border",
  },
};

interface QuoteSummary {
  id: string;
  quote_number: string;
  status: string;
  total: number | null;
  currency: string | null;
  created_at: string;
}

const QUOTE_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
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
  approved: {
    label: "Accepted",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  declined: {
    label: "Declined",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  rejected: {
    label: "Declined",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function QuoteStatusBadge({ status }: { status?: string | null }) {
  const s = (status || "draft").toLowerCase();
  const config = QUOTE_STATUS_CONFIG[s] ?? {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ") : "Draft",
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-semibold px-2 py-0.5 capitalize", config.className)}
    >
      {config.label}
    </Badge>
  );
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

function renderJsonbRows(raw: unknown) {
  if (!raw) {
    return <p className="text-sm text-muted-foreground italic">None specified</p>;
  }

  let data: Record<string, unknown> | null = null;

  if (typeof raw === "object" && !Array.isArray(raw)) {
    data = raw as Record<string, unknown>;
  } else if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          data = parsed as Record<string, unknown>;
        }
      } catch {
        // Not a JSON object string
      }
    }
    if (!data) {
      if (!trimmed) {
        return <p className="text-sm text-muted-foreground italic">None specified</p>;
      }
      return <p className="text-sm text-foreground whitespace-pre-wrap">{trimmed}</p>;
    }
  } else if (Array.isArray(raw)) {
    if (raw.length === 0) {
      return <p className="text-sm text-muted-foreground italic">None specified</p>;
    }
    return (
      <ul className="list-disc list-inside text-sm text-foreground space-y-1">
        {raw.map((item, i) => (
          <li key={i}>{String(item)}</li>
        ))}
      </ul>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground italic">None specified</p>;
  }

  // Filter out empty values
  const validEntries = Object.entries(data).filter(([, val]) => {
    if (val === null || val === undefined) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === "object" && Object.keys(val).length === 0) return false;
    return true;
  });

  if (validEntries.length === 0) {
    return <p className="text-sm text-muted-foreground italic">None specified</p>;
  }

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {validEntries.map(([key, val]) => {
        const label = key.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        let displayVal: string;
        if (typeof val === "boolean") {
          displayVal = val ? "Yes" : "No";
        } else if (Array.isArray(val)) {
          displayVal = val.join(", ");
        } else if (typeof val === "object") {
          displayVal = JSON.stringify(val);
        } else {
          displayVal = String(val);
        }
        return (
          <div key={key} className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground break-words">{displayVal}</dd>
          </div>
        );
      })}
    </dl>
  );
}

function AdminRequestDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<RequestRecord | null>(null);

  // Quotes state
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [creatingQuote, setCreatingQuote] = useState(false);

  // Actions local state
  const [internalNotes, setInternalNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setQuotesLoading(true);
    setQuotesError(null);
    try {
      const { data, error: qError } = await supabase
        .from("quotes")
        .select("id, quote_number, status, total, currency, created_at")
        .eq("request_id", id)
        .order("created_at", { ascending: false });

      if (qError) {
        throw new Error(qError.message);
      }

      setQuotes((data as QuoteSummary[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load quotes.";
      setQuotesError(msg);
    } finally {
      setQuotesLoading(false);
    }
  }, [id]);

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const { data, error: queryError } = await supabase
        .from("requests")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (queryError) {
        throw new Error(queryError.message);
      }

      if (!data) {
        setNotFound(true);
        setRequest(null);
        return;
      }

      const rec = data as RequestRecord;
      setRequest(rec);
      setInternalNotes(rec.internal_notes ?? "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load request.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchRequest();
    void fetchQuotes();
  }, [fetchRequest, fetchQuotes]);

  // Create Quote Handler
  async function handleCreateQuote() {
    if (!user?.id) {
      toast.error("You must be logged in as an admin to create quotes.");
      return;
    }
    setCreatingQuote(true);
    try {
      const { data, error: insertError } = await supabase
        .from("quotes")
        .insert({
          request_id: id,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (data?.id) {
        toast.success("Quote created successfully");
        void navigate({
          to: "/admin/quotes/$id",
          params: { id: data.id },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create quote.";
      toast.error(msg);
    } finally {
      setCreatingQuote(false);
    }
  }

  // Status Change Handler
  async function handleStatusChange(newStatus: string) {
    if (!request) return;
    setUpdatingStatus(true);
    try {
      const { error: updateError } = await supabase
        .from("requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      const label = STATUS_OPTIONS.find((o) => o.value === newStatus)?.label ?? newStatus;
      toast.success(`Status updated to ${label}`);
      await fetchRequest();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status.";
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Assign to me Handler
  async function handleAssignToMe() {
    if (!user?.id) {
      toast.error("You must be logged in as an admin to assign requests.");
      return;
    }
    setAssigning(true);
    try {
      const { error: assignError } = await supabase
        .from("requests")
        .update({ assigned_to: user.id })
        .eq("id", id);

      if (assignError) {
        throw new Error(assignError.message);
      }

      toast.success("Request assigned to you");
      await fetchRequest();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign request.";
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  }

  // Save Internal Notes Handler
  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      const { error: notesError } = await supabase
        .from("requests")
        .update({ internal_notes: internalNotes })
        .eq("id", id);

      if (notesError) {
        throw new Error(notesError.message);
      }

      toast.success("Internal notes saved");
      await fetchRequest();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save internal notes.";
      toast.error(msg);
    } finally {
      setSavingNotes(false);
    }
  }

  // 1. Loading State
  if (loading && !request) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && !request) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to requests
        </Link>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="size-10 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Failed to load request</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-5">{error}</p>
          <Button onClick={() => void fetchRequest()} variant="outline" className="gap-2">
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // 3. Not Found State
  if (notFound || !request) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to requests
        </Link>
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs">
          <HelpCircle className="size-12 text-muted-foreground/60 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-foreground">Request Not Found</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            The request with ID <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{id}</code>{" "}
            could not be found. It may have been removed or the ID is incorrect.
          </p>
          <div className="mt-6">
            <Button asChild variant="default">
              <Link to="/admin/requests">Return to Requests List</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Derived display values
  const requestCode =
    request.request_code || request.code || `REQ-${request.id.slice(0, 8).toUpperCase()}`;
  const contactName = request.name || request.student_name || "—";
  const contactEmail = request.email || "—";
  const contactPhone = request.phone ? formatPhone(request.phone) || request.phone : "—";
  const contactOrg = request.org || request.college || "—";
  const contactCity = request.city || "—";
  const contactType = request.customer_type || "—";

  const projectName = request.service || request.service_type || "General Inquiry";
  const projectIdea = request.idea || request.description || "—";
  const projectDeadline = request.deadline || "—";
  const projectBudget = request.budget || "—";

  const techDetailsData = request.technical_details ?? request.tech_details;
  const deliverablesData = request.deliverables;

  const currentStatus = (request.status ?? "new").toLowerCase();
  const statusBadgeConfig = STATUS_BADGES[currentStatus] ?? {
    label: currentStatus
      ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).replace(/_/g, " ")
      : "New",
    className: "bg-muted text-muted-foreground border-border",
  };

  const isAssignedToMe = Boolean(user?.id && request.assigned_to === user.id);
  const wa = request.phone
    ? whatsappUrl(
        request.phone,
        `Hi ${contactName !== "—" ? contactName : ""}, this is Nexora Technologies about your request ${requestCode}.`.trim(),
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Top Bar: Back Link */}
      <div>
        <Link
          to="/admin/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to requests</span>
        </Link>
      </div>

      {/* Header with Title, Status Badge, Dates */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              {requestCode}
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
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground/70" />
              <span>Created {formatDateTime(request.created_at)}</span>
            </div>
            {request.updated_at && (
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground/70" />
                <span>Updated {formatDateTime(request.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Refresh button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void fetchRequest();
              void fetchQuotes();
            }}
            disabled={loading || quotesLoading}
            className="gap-2 text-xs h-8"
          >
            <RefreshCw className={cn("size-3.5", (loading || quotesLoading) && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Two Column Layout: Main Details (Left 2 cols) & Actions (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact, Project, Technical Details, Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-royal/10 text-royal dark:text-glow">
                  <User className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
                  <CardDescription className="text-xs">
                    Client profile and reachability details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {/* Name */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Full Name
                  </span>
                  <span className="mt-1 font-medium text-foreground block">{contactName}</span>
                </div>

                {/* Customer Type */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Customer Type
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Tag className="size-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{contactType}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Email Address
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground shrink-0" />
                    {contactEmail !== "—" ? (
                      <a
                        href={`mailto:${contactEmail}`}
                        className="font-medium text-foreground hover:text-royal hover:underline truncate"
                      >
                        {contactEmail}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Phone / WhatsApp
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Phone className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{contactPhone}</span>
                    </div>
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity"
                      >
                        <MessageCircle className="size-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Organization / College */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    College / Organization
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground">{contactOrg}</span>
                  </div>
                </div>

                {/* City */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    City / Location
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground">{contactCity}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet/10 text-violet dark:text-violet-300">
                  <Cpu className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Project Scope</CardTitle>
                  <CardDescription className="text-xs">
                    Service required, problem statement, and timelines
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {/* Service */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Service Area
                  </span>
                  <span className="mt-1 font-medium text-foreground capitalize block">
                    {projectName.replace(/-/g, " ")}
                  </span>
                </div>

                {/* Deadline */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Target Deadline
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{projectDeadline}</span>
                  </div>
                </div>

                {/* Budget */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Estimated Budget
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <CircleDollarSign className="size-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{projectBudget}</span>
                  </div>
                </div>
              </div>

              {/* Project Idea / Description */}
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Project Idea &amp; Requirements
                </span>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {projectIdea}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quotes Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-royal/10 text-royal dark:text-glow">
                  <Receipt className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Quotes</CardTitle>
                  <CardDescription className="text-xs">
                    Milestone breakdowns, pricing estimates, and customer approval status
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={() => void handleCreateQuote()}
                disabled={creatingQuote}
                className="gap-1.5 text-xs h-8 bg-brand-gradient text-white hover:opacity-90 self-start sm:self-auto"
              >
                {creatingQuote ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                <span>{creatingQuote ? "Creating..." : "Create quote"}</span>
              </Button>
            </CardHeader>

            <CardContent>
              {/* Quotes Loading State */}
              {quotesLoading && (
                <div className="space-y-2 py-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              )}

              {/* Quotes Error State */}
              {!quotesLoading && quotesError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center space-y-2">
                  <p className="text-xs text-destructive">{quotesError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchQuotes()}
                    className="h-7 text-xs border-border gap-1.5"
                  >
                    <RefreshCw className="size-3" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Quotes Empty State */}
              {!quotesLoading && !quotesError && quotes.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <Receipt className="size-8 text-muted-foreground/60 mx-auto mb-2" />
                  <p className="text-xs font-medium text-foreground">No quotes created yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                    Generate an official milestone quote for this customer request.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleCreateQuote()}
                    disabled={creatingQuote}
                    className="h-8 text-xs gap-1.5 border-border"
                  >
                    <Plus className="size-3.5" />
                    Create first quote
                  </Button>
                </div>
              )}

              {/* Quotes Table */}
              {!quotesLoading && !quotesError && quotes.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="border-b border-border text-[11px]">
                        <TableHead className="font-semibold text-xs py-2.5">Quote Number</TableHead>
                        <TableHead className="font-semibold text-xs py-2.5">Status</TableHead>
                        <TableHead className="font-semibold text-xs py-2.5 text-right">
                          Total
                        </TableHead>
                        <TableHead className="font-semibold text-xs py-2.5 text-right pr-4">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotes.map((q) => (
                        <TableRow key={q.id} className="border-b border-border hover:bg-muted/20">
                          <TableCell className="font-mono font-semibold text-xs py-3 text-foreground">
                            {q.quote_number}
                          </TableCell>
                          <TableCell className="py-3">
                            <QuoteStatusBadge status={q.status} />
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-foreground text-right py-3">
                            {formatMoney(q.total, q.currency || "INR")}
                          </TableCell>
                          <TableCell className="text-right py-3 pr-4">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-border px-2.5 gap-1"
                            >
                              <Link to="/admin/quotes/$id" params={{ id: q.id }}>
                                <span>Open</span>
                                <ArrowUpRight className="size-3" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Details Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Layers className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Technical Details</CardTitle>
                  <CardDescription className="text-xs">
                    Structured specifications and hardware parameters
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>{renderJsonbRows(techDetailsData)}</CardContent>
          </Card>

          {/* Deliverables Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Deliverables</CardTitle>
                  <CardDescription className="text-xs">
                    Milestone outputs, prototypes, code, and documentation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>{renderJsonbRows(deliverablesData)}</CardContent>
          </Card>
        </div>

        {/* Right Column: Actions Card */}
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-xs sticky top-20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-gradient text-white">
                  <FileText className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Actions &amp; Workflow</CardTitle>
                  <CardDescription className="text-xs">
                    Admin controls and private telemetry
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 1. Status Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Request Status
                </label>
                <Select
                  value={currentStatus}
                  onValueChange={(val: StatusValue) => void handleStatusChange(val)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              opt.value === "new" && "bg-emerald-500",
                              opt.value === "under_review" && "bg-royal",
                              opt.value === "consultation" && "bg-violet",
                              opt.value === "qualified" && "bg-amber-500",
                              opt.value === "rejected" && "bg-destructive",
                              opt.value === "closed" && "bg-muted-foreground",
                            )}
                          />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updatingStatus && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <LoaderCircle className="size-3 animate-spin" />
                    Updating status...
                  </p>
                )}
              </div>

              {/* 2. Assign to me Button */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Assignment
                </label>
                {isAssignedToMe ? (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <UserCheck className="size-4" />
                    <span>Assigned to you</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => void handleAssignToMe()}
                    disabled={assigning}
                    variant="outline"
                    className="w-full justify-center gap-2 text-xs h-9 border-border"
                  >
                    {assigning ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="size-3.5" />
                    )}
                    <span>{request.assigned_to ? "Reassign to me" : "Assign to me"}</span>
                  </Button>
                )}
                {request.assigned_to && !isAssignedToMe && (
                  <p className="text-[11px] text-muted-foreground">
                    Currently assigned to member ID:{" "}
                    <code className="bg-muted px-1 rounded">
                      {request.assigned_to.slice(0, 8)}...
                    </code>
                  </p>
                )}
              </div>

              {/* 3. Internal Notes Textarea */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="internal-notes-input"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
                  >
                    Internal Notes
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                    Admin only
                  </span>
                </div>
                <Textarea
                  id="internal-notes-input"
                  placeholder="Private engineering notes, call summaries, component lead times..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={5}
                  className="resize-y text-xs leading-relaxed"
                />
                <Button
                  onClick={() => void handleSaveNotes()}
                  disabled={savingNotes}
                  size="sm"
                  className="w-full gap-2 text-xs bg-brand-gradient text-white hover:opacity-90"
                >
                  {savingNotes ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  <span>Save Notes</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
