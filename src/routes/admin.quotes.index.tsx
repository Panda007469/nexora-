import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";
import { meta } from "@/components/nexora/shared";

export const Route = createFileRoute("/admin/quotes/")({
  head: () => meta("Quotes | Admin", "Manage customer quotations and approval status."),
  component: AdminQuotesIndexPage,
});

function AdminQuotesIndexPage() {
  return (
    <AdminPlaceholder
      title="Quotes"
      description="View and filter all quotes in one place. Open any request from Requests to create or edit its quotes right now."
      icon={Receipt}
      badgeText="Index Planned"
      actionLabel="Browse Requests"
      actionTo="/admin/requests"
    />
  );
}
