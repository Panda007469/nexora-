import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LoaderCircle } from "lucide-react";

interface RequireRoleProps {
  role: "admin" | "member";
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { user, role: userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/login" });
      return;
    }
    if (userRole !== role) {
      void navigate({ to: "/" });
    }
  }, [user, userRole, role, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-royal dark:text-glow" />
      </div>
    );
  }

  if (!user || userRole !== role) {
    return null;
  }

  return <>{children}</>;
}
