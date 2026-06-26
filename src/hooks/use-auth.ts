import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminRole = async (authUser: User) => {
      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!mounted) return;

      if (roleError) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(roleRow?.role === "admin");
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      // Only react to identity transitions. TOKEN_REFRESHED and INITIAL_SESSION
      // fire frequently (tab focus, hourly refresh) and would re-render the
      // whole admin tree mid-upload, potentially losing in-progress work.
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") {
        return;
      }
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => void checkAdminRole(s.user), 0);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        await checkAdminRole(data.session.user);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, isAdmin, loading };
}