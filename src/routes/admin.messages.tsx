import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Mail,
  Phone,
  MessageCircle,
  MessageSquare,
  Calendar,
  CheckCheck,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  Inbox,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { whatsappUrl, formatPhone } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { meta } from "@/components/nexora/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/messages")({
  head: () =>
    meta(
      "Contact Messages | Admin",
      "Review and manage incoming messages from the public contact form.",
    ),
  component: AdminMessagesPage,
});

interface ContactMessage {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  status?: string | null;
  created_at: string;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  unread: {
    label: "Unread",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  read: {
    label: "Read",
    className: "bg-muted text-muted-foreground border-border",
  },
};

function StatusBadge({ status }: { status?: string | null | undefined }) {
  const key = (status ?? "new").toLowerCase();
  const config = STATUS_BADGES[key] ?? {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ") : "New",
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

function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (queryError) {
        setError(queryError.message);
        toast.error("Failed to load messages", { description: queryError.message });
      } else {
        setMessages((data as ContactMessage[]) ?? []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load contact messages.";
      setError(msg);
      toast.error("Failed to load messages", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const handleMarkAsRead = async (id: string) => {
    setUpdatingId(id);
    try {
      const { error: updateError } = await supabase
        .from("contact_messages")
        .update({ status: "read" })
        .eq("id", id);

      if (updateError) {
        toast.error("Could not update status", { description: updateError.message });
        return;
      }

      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "read" } : m)));
      toast.success("Message marked as read");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not update message status.";
      toast.error("Could not update status", { description: msg });
    } finally {
      setUpdatingId(null);
    }
  };

  const unreadCount = messages.filter((m) => (m.status ?? "new").toLowerCase() !== "read").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-xs">
              <MessageSquare className="size-4" />
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Contact Messages
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {loading
                  ? "Loading inquiries..."
                  : `${messages.length} total · ${unreadCount} unread`}
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void fetchMessages()}
          disabled={loading}
          className="self-start sm:self-auto gap-2 rounded-xl border-border"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-border bg-card">
          <LoaderCircle className="size-8 animate-spin text-royal dark:text-glow mb-3" />
          <p className="text-xs font-display uppercase tracking-widest text-muted-foreground">
            Loading Contact Messages...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-destructive/30 bg-destructive/5 text-center">
          <AlertCircle className="size-8 text-destructive mb-3" />
          <h2 className="font-heading text-base font-bold text-foreground mb-1">
            Unable to load contact messages
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-4">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void fetchMessages()}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-border bg-card text-center">
          <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <Inbox className="size-6" />
          </div>
          <h2 className="font-heading text-base font-bold text-foreground mb-1">No messages yet</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            Inquiries submitted through the public Contact page will appear here.
          </p>
        </div>
      )}

      {/* Messages List */}
      {!loading && !error && messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg) => {
            const isRead = (msg.status ?? "new").toLowerCase() === "read";
            const waHref = msg.phone ? whatsappUrl(msg.phone) : null;

            return (
              <Card
                key={msg.id}
                className={cn(
                  "border-border bg-card transition-colors",
                  !isRead && "border-royal/40 dark:border-glow/40",
                )}
              >
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 font-heading font-bold text-base text-foreground">
                        <User className="size-4 text-royal dark:text-glow shrink-0" />
                        {msg.name?.trim() || "Anonymous"}
                      </span>
                      <StatusBadge status={msg.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      {msg.email && (
                        <a
                          href={`mailto:${msg.email}`}
                          className="inline-flex items-center gap-1.5 text-royal dark:text-glow hover:underline break-all"
                        >
                          <Mail className="size-3.5 shrink-0" />
                          {msg.email}
                        </a>
                      )}

                      {msg.phone && (
                        <span className="inline-flex items-center gap-1.5 text-foreground/80">
                          <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                          {formatPhone(msg.phone) || msg.phone}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5 shrink-0" />
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {waHref && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-xs border-[#25D366]/40 text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366]/10"
                      >
                        <a href={waHref} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="size-3.5 mr-1.5" />
                          WhatsApp
                        </a>
                      </Button>
                    )}

                    {!isRead && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={updatingId === msg.id}
                        onClick={() => void handleMarkAsRead(msg.id)}
                        className="h-8 rounded-lg text-xs bg-brand-gradient text-white hover:opacity-90"
                      >
                        {updatingId === msg.id ? (
                          <LoaderCircle className="size-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <CheckCheck className="size-3.5 mr-1.5" />
                        )}
                        Mark as read
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="rounded-xl bg-muted/50 border border-border/60 p-3.5 text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                    {msg.message || "(No message body)"}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
