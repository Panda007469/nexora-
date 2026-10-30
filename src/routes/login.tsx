import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, Eye, EyeOff, LoaderCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeUp } from "@/components/layout/FadeUp";
import { meta } from "@/components/nexora/shared";
import { useAuth, signIn, type Role } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  head: () =>
    meta(
      "Log In",
      "Sign in to access the Nexora administration portal and member dashboard.",
    ),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleRoleRedirect = (targetRole: Role | string | undefined | null) => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;

    if (targetRole === "admin") {
      void navigate({ to: "/admin" as any });
    } else {
      toast.error("Your account has no admin access");
      void navigate({ to: "/" });
    }
  };

  // If already signed in on initial mount, wait for loading to finish and redirect
  useEffect(() => {
    if (loading) return;
    if (!user) return;

    handleRoleRedirect(role);
  }, [loading, user, role]);

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: authData, error } = await signIn(values.email, values.password);

      if (error) {
        setIsSubmitting(false);
        toast.error(error.message);
        return;
      }

      if (authData?.user) {
        // Query the role directly for fast, deterministic redirection
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id)
          .maybeSingle();

        const userRole = (roleData as { role?: string } | null)?.role ?? null;
        handleRoleRedirect(userRole);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during sign in.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        title="Account Log In"
        breadcrumb={[{ label: "Login" }]}
      />

      <main className="container py-12 md:py-20">
        <div className="max-w-lg mx-auto">
          <FadeUp>
            <div className="rounded-3xl border border-border bg-card p-7 sm:p-10 shadow-lg relative overflow-hidden">
              <div className="mb-8 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-royal/20 bg-royal/10 dark:bg-royal/20 px-3 py-1 text-royal dark:text-glow text-[11px] font-bold font-display uppercase tracking-widest mb-3">
                  <ShieldCheck className="size-3.5" />
                  <span>SECURE ACCESS</span>
                </div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Sign in with your email and password to access the Nexora internal workbench.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                  >
                    Email Address <span className="text-magenta">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@college.edu or team email"
                      disabled={isSubmitting || (Boolean(user) && !loading)}
                      {...register("email")}
                      className={cn(
                        "w-full h-11 rounded-xl pl-10 pr-4 text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                        errors.email
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-border focus:border-royal focus:ring-royal/30",
                      )}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-xs text-destructive mt-1.5 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold font-display uppercase tracking-wider text-foreground mb-2"
                  >
                    Password <span className="text-magenta">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={isSubmitting || (Boolean(user) && !loading)}
                      {...register("password")}
                      className={cn(
                        "w-full h-11 rounded-xl pl-10 pr-11 text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                        errors.password
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-border focus:border-royal focus:ring-royal/30",
                      )}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-xs text-destructive mt-1.5 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || (Boolean(user) && !loading)}
                  className="w-full bg-brand-gradient text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all h-12 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin mr-2" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight className="size-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center pt-2">
                  Access is restricted to authorized Nexora team members and administrators.
                </p>
              </form>
            </div>
          </FadeUp>
        </div>
      </main>
    </div>
  );
}
