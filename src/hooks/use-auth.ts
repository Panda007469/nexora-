import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Role = "admin" | "member" | null;

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRole(userId: string): Promise<Role> {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (error || !data) {
          return null;
        }

        const roleValue = (data as { role?: string }).role;
        if (roleValue === "admin" || roleValue === "member") {
          return roleValue;
        }
        return null;
      } catch {
        return null;
      }
    }

    async function initSession() {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !initialSession) {
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setSession(initialSession);
        setUser(initialSession.user);

        const currentRole = await loadRole(initialSession.user.id);
        if (!mounted) return;

        setRole(currentRole);
        setLoading(false);
      } catch {
        if (mounted) {
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    }

    void initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        const nextRole = await loadRole(nextUser.id);
        if (!mounted) return;
        setRole(nextRole);
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    role,
    loading,
    signIn,
    signOut,
  };
}

