import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLES = ["field_officer", "ministry_official", "researcher", "admin"] as const;
type Role = (typeof ROLES)[number];

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("Only administrators can do this.");
}

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  role: Role | null;
  createdAt: string;
  lastSignIn: string | null;
};

export const listUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUser[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: list }, { data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 500 }),
      supabaseAdmin.from("profiles").select("id, full_name, organization"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    return (list?.users ?? []).map((u) => {
      const p = profiles?.find((x) => x.id === u.id);
      const r = roles?.find((x) => x.user_id === u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        fullName: p?.full_name ?? "",
        organization: p?.organization ?? "",
        role: (r?.role as Role) ?? null,
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at ?? null,
      };
    });
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: Role }) => {
    if (!ROLES.includes(d.role)) throw new Error("Unknown role");
    if (typeof d.userId !== "string" || d.userId.length < 10) throw new Error("Bad user");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId && data.role !== "admin") {
      throw new Error("You can't remove your own administrator role.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).neq("role", data.role);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
