import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ROLE_LABELS, type AppRole } from "@/lib/auth";
import { fieldCls } from "@/components/ui-kit";
import { ensureDemoAccount, DEMO_ROLES, DEMO_PASSWORD, type DemoRole } from "@/lib/demo.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Tree360 Rwanda" },
      { name: "description", content: "Sign in to Tree360 Rwanda as a field officer, official, researcher or administrator." },
      { property: "og:title", content: "Sign in — Tree360 Rwanda" },
      { property: "og:description", content: "Access the Tree360 Rwanda tree monitoring platform." },
    ],
  }),
  component: AuthPage,
});

const SELF_ROLES: AppRole[] = ["field_officer", "ministry_official", "researcher"];

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<AppRole>("field_officer");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  const demoLogin = async (r: DemoRole) => {
    setBusy(true);
    try {
      const { email } = await ensureDemoAccount({ data: { role: r } });
      const { error } = await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
      if (error) toast.error(error.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Demo sign-in failed");
    }
    setBusy(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard",
          data: { full_name: fullName, organization, requested_role: role },
        },
      });
      if (error) toast.error(error.message);
      else setSent(true);
    }
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Leaf className="size-5" /></span>
          <div>
            <p className="font-bold tracking-wide">TREE360 RWANDA</p>
            <p className="text-xs text-muted-foreground">{mode === "in" ? "Sign in to your account" : "Create your account"}</p>
          </div>
        </div>

        {sent ? (
          <div className="space-y-3 text-sm">
            <p className="font-medium">Check your email</p>
            <p className="text-muted-foreground">We sent a confirmation link to <b>{email}</b>. Open it to finish creating your account, then sign in.</p>
            <button className="text-primary" onClick={() => { setSent(false); setMode("in"); }}>Back to sign in</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && (
              <>
                <label className="block text-sm">Full name<input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={fieldCls} /></label>
                <label className="block text-sm">Organization<input value={organization} onChange={(e) => setOrganization(e.target.value)} className={fieldCls} placeholder="e.g. Rwanda Forestry Authority" /></label>
                <label className="block text-sm">I am a…
                  <select value={role} onChange={(e) => setRole(e.target.value as AppRole)} className={fieldCls}>
                    {SELF_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </label>
              </>
            )}
            <label className="block text-sm">Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldCls} /></label>
            <label className="block text-sm">Password<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={fieldCls} /></label>
            <button disabled={busy} className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60">
              {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
            </button>
            <p className="pt-2 text-center text-sm text-muted-foreground">
              {mode === "in" ? "No account yet? " : "Already have an account? "}
              <button type="button" className="font-medium text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
                {mode === "in" ? "Create one" : "Sign in"}
              </button>
            </p>
            {mode === "up" && <p className="text-xs text-muted-foreground">Administrator accounts are assigned by an existing administrator.</p>}
            {mode === "in" && (
              <div className="border-t pt-4">
                <p className="mb-2 text-center text-xs font-medium text-muted-foreground">Or try the demo instantly as…</p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ROLES.map((r) => (
                    <button key={r} type="button" disabled={busy} onClick={() => demoLogin(r)}
                      className="rounded-lg border bg-background px-2 py-2 text-xs font-medium hover:bg-muted disabled:opacity-60">
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
