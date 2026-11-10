import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";
import { meta } from "@/components/nexora/shared";

export const Route = createFileRoute("/admin/projects")({
  head: () => meta("Projects | Admin", "Manage published showcase projects and media."),
  component: AdminProjectsPage,
});

function AdminProjectsPage() {
  return (
    <AdminPlaceholder
      title="Projects"
      description="Create, edit, upload showcase images, and publish projects to the public Nexora portfolio."
      icon={FolderKanban}
      badgeText="Phase 4A"
    />
  );
}

