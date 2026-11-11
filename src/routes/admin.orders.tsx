import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";
import { meta } from "@/components/nexora/shared";

export const Route = createFileRoute("/admin/orders")({
  head: () => meta("Orders | Admin", "Track active customer orders and project milestones."),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  return (
    <AdminPlaceholder
      title="Orders"
      description="Convert accepted quotes into active builds, track payments, and manage delivery milestones."
      icon={Package}
    />
  );
}
