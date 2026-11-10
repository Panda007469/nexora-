import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Search,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  Inbox,
  ArrowUpRight,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { meta } from "@/components/nexora/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/requests/")({
  validateSearch: (search: Record<string, unknown>): { status?: string | undefined } => ({
    status: typeof search["status"] === "string" ? search["status"] : undefined,
  }),
  head: () =>
    meta(
      "Customer Requests | Admin",
      "Manage incoming engineering inquiries, prototyping scopes, and client communications.",
    ),
  component: AdminRequestsPage,
});

interface RequestItem {
  id: string;
  request_code?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  status?: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

const STATUS_CHIPS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "under_review", label: "Under review" },
  { value: "consultation", label: "Consultation" },
  { value: "qualified", label: "Qualified" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
] as const;

type StatusFilter = (typeof STATUS_CHIPS)[number]["value"];

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
  const key = (status ?? "new").toLowerCase();
  const config = STATUS_BADGES[key] ?? {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ") : "Unknown",
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-semibold text-[11px]", config.className)}
    >
      {config.label}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function AdminRequestsPage() {
  const search = Route.useSearch();
  const initialStatus: StatusFilter =
    search.status && STATUS_CHIPS.some((chip) => chip.value === search.status)
      ? (search.status as StatusFilter)
      : "all";

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Sync when search param status changes
  useEffect(() => {
    if (search.status && STATUS_CHIPS.some((chip) => chip.value === search.status)) {
      setStatusFilter(search.status as StatusFilter);
    } else if (!search.status || search.status === "all") {
      setStatusFilter("all");
    }
  }, [search.status]);

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("requests")
        .select("id, request_code, name, email, phone, service, status, created_at", {
          count: "exact",
        })
        .order("created_at", { ascending: false });

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply search with % and , stripped
      const cleanQ = debouncedSearch.replace(/[%,\\]/g, "").trim();
      if (cleanQ) {
        query = query.or(
          `name.ilike.%${cleanQ}%,email.ilike.%${cleanQ}%,request_code.ilike.%${cleanQ}%`,
        );
      }

      // Apply range for pagination
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setRequests(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load requests";
      setError(msg);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const fromIndex = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toIndex = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <div className="p-6 sm:p-8 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3 py-1 text-royal dark:text-glow text-[11px] font-bold font-display uppercase tracking-widest mb-2">
            <FileText className="size-3" />
            <span>PIPELINE MANAGEMENT</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
            Customer Requests
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse, filter, and respond to incoming project inquiries and technical briefs.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void fetchRequests()}
          disabled={loading}
          className="self-start sm:self-auto gap-2 border-border text-xs font-semibold h-9 rounded-xl hover:bg-muted"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="tablist"
          aria-label="Status filters"
        >
          {STATUS_CHIPS.map((chip) => {
            const isActive = statusFilter === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setStatusFilter(chip.value)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-brand-gradient text-white shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Search Input (Filters by name, email, or request_code) */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search code, name, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-xl bg-card border-border text-xs sm:text-sm focus-visible:ring-royal/30"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Loading, Error, Empty, or Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {loading && requests.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <LoaderCircle className="size-8 animate-spin text-royal dark:text-glow mb-3" />
            <p className="text-sm font-semibold text-foreground">Loading customer requests...</p>
            <p className="text-xs text-muted-foreground mt-1">Connecting to database</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
              <AlertCircle className="size-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Failed to Load Requests
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void fetchRequests()}
              className="mt-4 gap-2 text-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Try Again</span>
            </Button>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="size-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mb-3.5 border border-border">
              <Inbox className="size-7" />
            </div>
            <h3 className="font-heading font-bold text-base text-foreground">No Requests Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {debouncedSearch || statusFilter !== "all"
                ? "No customer inquiries matched your active search or status filter."
                : "There are currently no customer requests in the pipeline."}
            </p>
            {(debouncedSearch || statusFilter !== "all") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setSearchInput("");
                }}
                className="mt-4 text-xs font-semibold text-royal dark:text-glow hover:underline"
              >
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/80 bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-36">
                    Request Code
                  </TableHead>
                  <TableHead className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Service
                  </TableHead>
                  <TableHead className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Submitted
                  </TableHead>
                  <TableHead className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((row) => {
                  const requestCode = row.request_code || row.id.slice(0, 8);
                  const name = row.name || "Customer";
                  const wa = row.phone
                    ? whatsappUrl(
                        row.phone,
                        `Hi ${name}, this is Nexora Technologies about your request ${requestCode}.`,
                      )
                    : null;

                  return (
                    <TableRow
                      key={row.id}
                      className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                    >
                      {/* Code */}
                      <TableCell className="font-mono text-xs font-semibold text-foreground py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-muted border border-border/60 text-foreground">
                          {requestCode}
                        </span>
                      </TableCell>

                      {/* Customer Contact */}
                      <TableCell className="py-3.5">
                        <div className="font-semibold text-sm text-foreground">{name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {row.email || "No email"}
                        </div>
                      </TableCell>

                      {/* Service */}
                      <TableCell className="py-3.5">
                        <span className="text-xs font-medium text-foreground capitalize">
                          {row.service?.replace(/-/g, " ") || "General Inquiry"}
                        </span>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-3.5">
                        <StatusBadge status={row.status} />
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-muted-foreground/70" />
                          <span>{formatDate(row.created_at)}</span>
                        </div>
                      </TableCell>

                      {/* Actions: View Link & WhatsApp */}
                      <TableCell className="py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {/* WhatsApp Button */}
                          {wa ? (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Chat with ${name} on WhatsApp`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity"
                            >
                              <MessageCircle className="size-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs px-2">—</span>
                          )}

                          {/* View Link */}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer / Pagination Controls */}
        {!error && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{fromIndex}</span> to{" "}
              <span className="font-semibold text-foreground">{toIndex}</span> of{" "}
              <span className="font-semibold text-foreground">{totalCount}</span> requests
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
                Page {page} of {totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="h-8 px-3 text-xs border-border gap-1"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="h-8 px-3 text-xs border-border gap-1"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
