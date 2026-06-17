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

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // Defer role check to avoid deadlocks inside the auth callback
        setTimeout(() => {
          supabase
            .rpc("has_role", { _user_id: s.user.id, _role: "admin" })
            .then(({ data }) => mounted && setIsAdmin(Boolean(data)));
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        supabase
          .rpc("has_role", { _user_id: data.session.user.id, _role: "admin" })
          .then(({ data: ok }) => mounted && setIsAdmin(Boolean(ok)));
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, isAdmin, loading };
}