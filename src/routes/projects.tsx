import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/projects")({ component: ProjectLayout });
function ProjectLayout() {
  return <Outlet />;
}
