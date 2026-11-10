import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Inbox,
  Calendar,
  MessageCircle,
  ArrowUpRight,
  MessageSquare,
  Search,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { meta } from "@/components/nexora/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () =>
    meta("Admin Dashboard", "Overview of customer requests and active engineering pipeline."),
  component: AdminDashboard,
});

interface RequestRow {
  id: string;
  request_code?: string | null;
  code?: string | null;
  name?: string | null;
  student_name?: string | null;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  service_type?: string | null;
  status?: string | null;
  created_at: string;
}

interface StatusCounts {
  total: number;
  new: number;
  under_review: number;
  consultation: number;
  qualified: number;
  rejected: number;
  closed: number;
}

const COUNT_CARDS = [
  {
    key: "total" as const,
    label: "Total Requests",
    shortLabel: "Total",
    statusParam: "all",
    icon: Inbox,
    iconWrapperClass: "bg-brand-gradient text-white shadow-2xs",
    hoverBorder: "hover:border-royal/50 hover:shadow-royal/5",
    description: "All pipeline records",
  },
  {
    key: "new" as const,
    label: "New",
    shortLabel: "New",
    statusParam: "new",
    icon: Clock,
    iconWrapperClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50 hover:shadow-emerald-500/5",
    description: "Awaiting triage",
  },
  {
    key: "under_review" as const,
    label: "Under Review",
    shortLabel: "Under review",
    statusParam: "under_review",
    icon: Search,
    iconWrapperClass: "bg-royal/10 text-royal dark:text-glow border border-royal/20",
    hoverBorder: "hover:border-royal/50 hover:shadow-royal/5",
    description: "Scope assessment",
  },
  {
    key: "consultation" as const,
    label: "Consultation",
    shortLabel: "Consultation",
    statusParam: "consultation",
    icon: MessageSquare,
    iconWrapperClass: "bg-violet/10 text-violet dark:text-violet-300 border border-violet/20",
    hoverBorder: "hover:border-violet/50 hover:shadow-violet/5",
    description: "Client discussion",
  },
  {
    key: "qualified" as const,
    label: "Qualified",
    shortLabel: "Qualified",
    statusParam: "qualified",
    icon: CheckCircle2,
    iconWrapperClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    hoverBorder: "hover:border-amber-500/50 hover:shadow-amber-500/5",
    description: "Approved for build",
  },
  {
    key: "rejected" as const,
    label: "Rejected",
    shortLabel: "Rejected",
    statusParam: "rejected",
    icon: XCircle,
    iconWrapperClass: "bg-destructive/10 text-destructive border border-destructive/20",
    hoverBorder: "hover:border-destructive/50 hover:shadow-destructive/5",
    description: "Out of scope",
  },
  {
    key: "closed" as const,
    label: "Closed",
    shortLabel: "Closed",
    statusParam: "closed",
    icon: CheckCheck,
    iconWrapperClass: "bg-muted text-muted-foreground border border-border",
    hoverBorder: "hover:border-muted-foreground/50 hover:shadow-muted/5",
    description: "Archived & fulfilled",
  },
] as const;

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

function StatusBadge({ status }: { status?: string | null | undefined }) {
  const s = (status || "new").toLowerCase();
  const config = STATUS_BADGES[s] ?? {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ") : "New",
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

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<StatusCounts | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Run total, status counts, and the 10 newest requests in parallel
      const [
        totalRes,
        newRes,
        underReviewRes,
        consultationRes,
        qualifiedRes,
        rejectedRes,
        closedRes,
        requestsRes,
      ] = await Promise.all([
        supabase.from("requests").select("id", { count: "exact", head: true }),
        supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "under_review"),
        supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "consultation"),
        supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "qualified"),
        supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "rejected"),
        supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "closed"),
        supabase
          .from("requests")
          .select("id, request_code, name, email, phone, service, status, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (requestsRes.error) {
        throw new Error(requestsRes.error.message);
      }
      if (totalRes.error) {
        throw new Error(totalRes.error.message);
      }

      setCounts({
        total: totalRes.count ?? 0,
        new: newRes.count ?? 0,
        under_review: underReviewRes.count ?? 0,
        consultation: consultationRes.count ?? 0,
        qualified: qualifiedRes.count ?? 0,
        rejected: rejectedRes.count ?? 0,
        closed: closedRes.count ?? 0,
      });

      setRequests((requestsRes.data as unknown as RequestRow[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3 py-0.5 text-royal dark:text-glow text-[11px] font-bold font-display uppercase tracking-widest mb-2">
            <span>ADMIN PIPELINE</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
            Engineering Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time telemetry and overview of hardware &amp; software prototyping requests.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void fetchDashboardData()}
          disabled={loading}
          className="self-start sm:self-auto rounded-xl border-border text-xs font-semibold h-9 gap-2"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Error Banner */}
      {!loading && error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
            <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="size-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Unable to Load Pipeline Data
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void fetchDashboardData()}
              className="mt-2 rounded-xl text-xs font-semibold border-border gap-2"
            >
              <RefreshCw className="size-3.5" />
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Grid of Counts Cards (Total, New, Under review, Consultation, Qualified, Rejected, Closed) */}
      <section aria-label="Status counts breakdown">
        {loading && !counts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="size-8 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-14 rounded-md" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {COUNT_CARDS.map((card) => {
              const Icon = card.icon;
              const countValue = counts ? counts[card.key] : 0;

              return (
                <Link
                  key={card.key}
                  to="/admin/requests"
                  search={{ status: card.statusParam }}
                  className={cn(
                    "group rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-md cursor-pointer block",
                    card.hoverBorder,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors truncate">
                      {card.shortLabel}
                    </span>
                    <div
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                        card.iconWrapperClass,
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
                        {countValue}
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1 truncate">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Table Section: 10 Newest Requests */}
      <section id="requests" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-foreground">
              10 Newest Requests
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sorted by submission date descending.
            </p>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-royal dark:text-glow hover:text-royal/80 gap-1.5"
          >
            <Link to="/admin/requests">
              <span>View all requests</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* State: Loading */}
        {loading && (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-xs">
            <div className="flex flex-col items-center justify-center gap-3">
              <LoaderCircle className="size-8 animate-spin text-royal dark:text-glow" />
              <p className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                Loading requests from Supabase...
              </p>
            </div>
          </div>
        )}

        {/* State: Empty */}
        {!loading && !error && requests.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-xs">
            <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
              <div className="size-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Inbox className="size-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">No Requests Yet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When students or clients submit the project request form, their submissions will
                appear here.
              </p>
            </div>
          </div>
        )}

        {/* State: Populated Table */}
        {!loading && !error && requests.length > 0 && (
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-display uppercase tracking-wider text-[10px]">
                  <tr>
                    <th scope="col" className="py-3.5 px-4 font-bold">
                      Code
                    </th>
                    <th scope="col" className="py-3.5 px-4 font-bold">
                      Client / Student
                    </th>
                    <th scope="col" className="py-3.5 px-4 font-bold">
                      Email
                    </th>
                    <th scope="col" className="py-3.5 px-4 font-bold">
                      Phone / Chat
                    </th>
                    <th scope="col" className="py-3.5 px-4 font-bold">
                      Service
                    </th>
                    <th scope="col" className="py-3.5 px-4 font-bold">
                      Status
                    </th>
                    <th scope="col" className="py-3.5 px-4 font-bold">
                      Created
                    </th>
                    <th scope="col" className="py-3.5 px-4 font-bold text-right pr-6">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((row) => {
                    const code =
                      row.request_code ||
                      row.code ||
                      (row.id ? `NX-${row.id.slice(0, 6).toUpperCase()}` : "—");
                    const name = row.name || row.student_name || "—";
                    const email = row.email || "—";
                    const service = row.service || row.service_type || "—";

                    const wa = row.phone
                      ? whatsappUrl(
                          row.phone,
                          `Hi ${name}, this is Nexora Technologies about your request ${code}.`,
                        )
                      : null;

                    return (
                      <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">{code}</td>
                        <td className="py-3.5 px-4 font-medium text-foreground">{name}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{email}</td>
                        <td className="py-3.5 px-4">
                          {wa ? (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-[#25D366] px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                            >
                              <MessageCircle className="size-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 capitalize text-foreground">{service}</td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3 text-muted-foreground/70" />
                            <span>{formatDate(row.created_at)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right pr-6">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-border px-2.5 gap-1"
                          >
                            <Link to="/admin/requests/$id" params={{ id: row.id }}>
                              <span>View</span>
                              <ArrowUpRight className="size-3" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
