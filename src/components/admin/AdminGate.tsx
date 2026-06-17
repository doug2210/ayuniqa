import { useState, type ReactNode } from "react";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (user && isAdmin) return <>{children}</>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pwd,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setInfo(
          "Account created. If email confirmation is enabled in your Supabase project, check your inbox. Then ask an admin to grant you the 'admin' role in the user_roles table.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white">
          <Lock />
        </div>
        <h1 className="mt-4 text-center text-2xl font-black">Admin access</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {user && !isAdmin
            ? "You're signed in but don't have admin privileges. Ask an admin to grant your account the 'admin' role."
            : mode === "signin"
              ? "Sign in with your admin email and password."
              : "Create an account. An existing admin must then promote it to admin in the user_roles table."}
        </p>

        {user && !isAdmin ? (
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
          >
            Sign out
          </Button>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="admin-pwd">Password</Label>
              <Input
                id="admin-pwd"
                type="password"
                required
                minLength={6}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {info && <p className="text-sm text-muted-foreground">{info}</p>}
            <Button type="submit" variant="shimmer" className="w-full" disabled={busy}>
              {mode === "signin" ? (
                <>
                  <LogIn /> Sign in
                </>
              ) : (
                <>
                  <UserPlus /> Create account
                </>
              )}
            </Button>
            <button
              type="button"
              className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
            >
              {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function adminSignOut() {
  void supabase.auth.signOut().then(() => {
    if (typeof window !== "undefined") window.location.reload();
  });
}