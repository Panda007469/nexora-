import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Inbox,
  User,
  Mail,
  Cpu,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { meta } from "@/components/nexora/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () =>
    meta(
      "Admin Dashboard",
      "Overview of customer requests and active engineering pipeline.",
    ),
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

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRequests, setTotalRequests] = useState<number | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError, count } = await supabase
        .from("requests")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(10);

      if (queryError) {
        throw new Error(queryError.message);
      }

      setRequests((data as unknown as RequestRow[]) || []);
      setTotalRequests(count ?? (data ? data.length : 0));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load request records.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchRequests();
  }, []);

  const getStatusBadge = (status?: string | null) => {
    const s = (status || "new").toLowerCase();
    switch (s) {
      case "done":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" />
            Done
          </span>
        );
      case "assigned":
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-royal/10 text-royal dark:text-glow border border-royal/20">
            <Clock className="size-3" />
            In Progress
          </span>
        );
      case "new":
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-3" />
            New
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
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
  };

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
          onClick={() => void fetchRequests()}
          disabled={loading}
          className="self-start sm:self-auto rounded-xl border-border text-xs font-semibold h-9"
        >
          <RefreshCw className={cn("size-3.5 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Requests Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground">
              Total Requests
            </span>
            <div className="size-10 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-2xs">
              <FileText className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading && totalRequests === null ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
            ) : error ? (
              <span className="text-2xl font-heading font-extrabold text-muted-foreground">—</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight">
                  {totalRequests ?? requests.length}
                </span>
                <span className="text-xs font-medium text-emerald-500">Live records</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Aggregated across all disciplines from Supabase.
          </p>
        </div>
      </div>

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
        </div>

        {/* State: Loading */}
        {loading && (
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <LoaderCircle className="size-8 animate-spin text-royal dark:text-glow" />
              <p className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                Loading requests from Supabase...
              </p>
            </div>
          </div>
        )}

        {/* State: Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
              <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertCircle className="size-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">
                Unable to Load Requests
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {error}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void fetchRequests()}
                className="mt-2 rounded-xl text-xs font-semibold border-border"
              >
                <RefreshCw className="size-3.5 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* State: Empty */}
        {!loading && !error && requests.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
              <div className="size-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Inbox className="size-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">
                No Requests Yet
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When students or clients submit the project request form, their submissions will appear here.
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
                      Phone
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

                    return (
                      <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          {code}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {name}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {email}
                        </td>
                        <td className="py-3.5 px-4">
                          {(() => {
                            const wa = row.phone
                              ? whatsappUrl(
                                  row.phone,
                                  `Hi ${name}, this is Nexora Technologies about your request ${code}.`,
                                )
                              : null;
                            return wa ? (
                              <a
                                href={wa}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-md bg-[#25D366] px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                              >
                                <MessageCircle className="size-3.5" />
                                WhatsApp
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 px-4 capitalize text-foreground">
                          {service}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(row.status)}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(row.created_at)}
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

