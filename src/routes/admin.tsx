import { useState, useEffect } from "react";
import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  LoaderCircle,
  Menu,
  X,
  Shield,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { meta } from "@/components/nexora/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () =>
    meta(
      "Admin Portal",
      "Nexora internal administration portal and request management pipeline.",
    ),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/login" });
      return;
    }
    if (role !== "admin") {
      void navigate({ to: "/" });
      return;
    }
  }, [user, role, loading, navigate]);

  // Centered spinner while checking auth session in browser storage
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="size-8 animate-spin text-royal dark:text-glow" />
          <p className="text-xs font-display uppercase tracking-widest text-muted-foreground">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  // Guard: only render for authenticated admins
  if (!user || role !== "admin") {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/login" });
  };

  const navItems = [
    {
      label: "Dashboard",
      to: "/admin",
      icon: LayoutDashboard,
      active: location.pathname === "/admin" || location.pathname === "/admin/",
    },
    {
      label: "Requests",
      to: "/admin#requests",
      icon: FileText,
      active: location.hash === "requests",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <Logo variant="mark" className="h-7 w-auto" />
            <span className="font-heading font-extrabold text-sm tracking-tight text-foreground">
              Nexora <span className="text-brand-gradient">Admin</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="size-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1.5 rounded-xl bg-muted/60 text-xs text-muted-foreground flex items-center gap-2">
            <User className="size-3.5 text-royal shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                    item.active
                      ? "bg-brand-gradient text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-border text-xs mt-2"
          >
            <LogOut className="size-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-card border-r border-border min-h-screen sticky top-0 h-screen p-5">
        {/* Brand Header */}
        <div className="pb-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2.5">
            <Logo variant="mark" className="h-8 w-auto" />
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight text-foreground block leading-tight">
                Nexora <span className="text-brand-gradient">Admin</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-display uppercase tracking-wider text-royal dark:text-glow">
                <Shield className="size-2.5" />
                Pipeline Console
              </span>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="my-6 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.to}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-display tracking-wider uppercase transition-all",
                  item.active
                    ? "bg-brand-gradient text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Sidebar Footer: ThemeToggle, User Email, Sign Out */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>

          <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60">
            <div className="flex items-center gap-2 text-xs">
              <div className="size-7 rounded-lg bg-royal/10 text-royal dark:bg-royal/20 dark:text-glow flex items-center justify-center shrink-0">
                <User className="size-3.5" />
              </div>
              <div className="truncate flex-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block font-display">
                  Signed in as
                </span>
                <span className="text-xs font-medium text-foreground truncate block" title={user.email}>
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            className="w-full justify-center text-xs font-semibold border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors h-10 rounded-xl"
          >
            <LogOut className="size-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

