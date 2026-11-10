import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";
import { meta } from "@/components/nexora/shared";

export const Route = createFileRoute("/admin/tasks")({
  head: () => meta("Tasks | Admin", "Assign and track engineering tasks across projects."),
  component: AdminTasksPage,
});

function AdminTasksPage() {
  return (
    <AdminPlaceholder
      title="Tasks"
      description="Break orders into hardware, firmware, and software tasks and assign them to team members."
      icon={CheckSquare}
    />
  );
}

