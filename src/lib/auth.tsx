import type React from "react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "field_officer" | "ministry_official" | "researcher" | "admin";

export const ROLE_LABELS: Record<AppRole, string> = {
  field_officer: "Field Officer",
  ministry_official: "Ministry / Forestry Official",
  researcher: "Researcher / Partner",
  admin: "System Administrator",
};

/** Which pages each role can open. */
export const ROLE_ACCESS: Record<AppRole, string[]> = {
  field_officer: ["/dashboard", "/map", "/inventory", "/inspections", "/fruit"],
  ministry_official: ["/dashboard", "/map", "/inventory", "/inspections", "/fruit", "/analytics", "/reports"],
  researcher: ["/dashboard", "/map", "/inventory", "/fruit", "/analytics", "/reports"],
  admin: ["/dashboard", "/map", "/inventory", "/inspections", "/fruit", "/analytics", "/reports", "/integration"],
};

/** First page each role sees after signing in. */
export const ROLE_LANDING: Record<AppRole, string> = {
  admin: "/dashboard",
  ministry_official: "/analytics",
  researcher: "/inventory",
  field_officer: "/inspections",
};

export function landingFor(roles: AppRole[]) {
  const order: AppRole[] = ["admin", "ministry_official", "researcher", "field_officer"];
  const r = order.find((x) => roles.includes(x));
  return r ? ROLE_LANDING[r] : "/dashboard";
}

export function canAccess(roles: AppRole[], path: string) {
  return roles.some((r) => ROLE_ACCESS[r].includes(path));
}

type AuthState = {
  loading: boolean;
  user: User | null;
  fullName: string;
  roles: AppRole[];
  signOut: () => Promise<void>;
};

// Keep one context instance across hot reloads so providers and consumers always match.
const g = globalThis as unknown as { __tree360AuthCtx?: React.Context<AuthState | null> };
const Ctx = g.__tree360AuthCtx ?? (g.__tree360AuthCtx = createContext<AuthState | null>(null));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    const load = async (u: User | null) => {
      setUser(u);
      if (!u) { setRoles([]); setFullName(""); setLoading(false); return; }
      setLoading(true);
      const [{ data: r }, { data: p }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", u.id),
        supabase.from("profiles").select("full_name").eq("id", u.id).maybeSingle(),
      ]);
      setRoles((r ?? []).map((x) => x.role as AppRole));
      setFullName(p?.full_name || u.email || "");
      setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        setTimeout(() => load(session?.user ?? null), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider value={{ loading, user, fullName, roles, signOut: async () => { await supabase.auth.signOut(); } }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
