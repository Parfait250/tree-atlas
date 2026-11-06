import { createServerFn } from "@tanstack/react-start";

export const DEMO_ROLES = ["field_officer", "ministry_official", "researcher", "admin"] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

export const DEMO_PASSWORD = "Tree360-demo!";
export const demoEmail = (role: DemoRole) => `demo.${role.replace("_", "-")}@tree360.rw`;

const NAMES: Record<DemoRole, string> = {
  field_officer: "Demo Field Officer",
  ministry_official: "Demo Ministry Official",
  researcher: "Demo Researcher",
  admin: "Demo Administrator",
};

/** Makes sure the shared demo account for a role exists, so the browser can sign in to it. */
export const ensureDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { role: DemoRole }) => {
    if (!DEMO_ROLES.includes(d.role)) throw new Error("Unknown role");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = demoEmail(data.role);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: NAMES[data.role],
        organization: "Tree360 Demo",
        requested_role: data.role === "admin" ? "field_officer" : data.role,
      },
    });
    let userId = created?.user?.id;
    if (error && !/already/i.test(error.message)) throw new Error(error.message);
    if (data.role === "admin") {
      if (!userId) {
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
        userId = list.users.find((u) => u.email === email)?.id;
      }
      if (userId) {
        await supabaseAdmin.from("user_roles").delete().eq("user_id", userId).neq("role", "admin");
        await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      }
    }
    return { email };
  });
