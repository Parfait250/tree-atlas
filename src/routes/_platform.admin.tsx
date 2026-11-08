import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Users, Download, RotateCcw, Activity } from "lucide-react";
import { Card, CardTitle, PageHeader, Stat } from "@/components/ui-kit";
import { listUsers, setUserRole, type AdminUser } from "@/lib/admin.functions";
import { ROLE_LABELS, useAuth, type AppRole } from "@/lib/auth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_platform/admin")({
  head: () => ({
    meta: [
      { title: "Admin Control Center — Tree360 Rwanda" },
      { name: "description", content: "Manage users, roles and platform data for Tree360 Rwanda." },
      { property: "og:title", content: "Admin Control Center — Tree360 Rwanda" },
      { property: "og:description", content: "User and role management for Tree360 administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const ROLES: AppRole[] = ["field_officer", "ministry_official", "researcher", "admin"];
const ROLE_BADGE: Record<AppRole, string> = {
  admin: "bg-gold-soft text-gold border-gold/40",
  ministry_official: "bg-sky-soft text-sky border-sky/40",
  researcher: "bg-muted text-foreground border-border",
  field_officer: "bg-secondary text-primary border-primary/30",
};

function AdminPage() {
  const { user } = useAuth();
  const { trees, inspections, reset } = useStore();
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listUsers);
  const changeRole = useServerFn(setUserRole);
  const [saving, setSaving] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
  });

  const counts = ROLES.reduce(
    (acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }),
    {} as Record<AppRole, number>,
  );
  const shown = users.filter((u) =>
    `${u.fullName} ${u.email} ${u.organization}`.toLowerCase().includes(q.toLowerCase()),
  );

  async function onRole(u: AdminUser, role: AppRole) {
    setSaving(u.id);
    try {
      await changeRole({ data: { userId: u.id, role } });
      toast.success(`${u.fullName || u.email} is now ${ROLE_LABELS[role]}`);
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not change role");
    } finally {
      setSaving(null);
    }
  }

  function backup() {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), trees, inspections, users }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tree360-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function onReset() {
    if (!confirm("Restore the sample trees and inspections? Records added on this device will be removed.")) return;
    reset();
    toast.success("Sample data restored");
  }

  const recent = [...users]
    .filter((u) => u.lastSignIn)
    .sort((a, b) => (b.lastSignIn ?? "").localeCompare(a.lastSignIn ?? ""))
    .slice(0, 6);

  return (
    <>
      <PageHeader title="Admin Control Center" sub="Manage who can use Tree360 and keep platform data in good shape." />

      <div className="mb-6 h-1.5 w-full rounded-full bg-gradient-to-r from-sky via-gold to-primary" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Registered users", value: users.length, icon: Users, cls: "bg-sky-soft text-sky border-sky/30" },
          { label: "Administrators", value: counts.admin ?? 0, icon: ShieldCheck, cls: "bg-gold-soft text-gold border-gold/30" },
          { label: "Field officers", value: counts.field_officer ?? 0, icon: Activity, cls: "bg-secondary text-primary border-primary/20" },
          { label: "Trees on record", value: trees.length, icon: Activity, cls: "bg-sky-soft text-sky border-sky/30" },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`rounded-xl border p-4 ${cls}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground/70">{label}</p>
              <Icon className="size-5" />
            </div>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Users & roles</CardTitle>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, organization"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm sm:w-72"
          />
        </div>
        {error ? (
          <p className="mt-4 text-sm text-destructive">{(error as Error).message}</p>
        ) : isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading users…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Organization</th>
                  <th className="py-2 pr-4">Joined</th>
                  <th className="py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{u.fullName || "—"}{u.id === user?.id && <span className="ml-2 text-xs text-primary">(you)</span>}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="py-3 pr-4">{u.organization || "—"}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <select
                        value={u.role ?? ""}
                        disabled={saving === u.id || u.id === user?.id}
                        onChange={(e) => onRole(u, e.target.value as AppRole)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium ${u.role ? ROLE_BADGE[u.role] : "border-input bg-background"}`}
                      >
                        {!u.role && <option value="">No role</option>}
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Data controls</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {trees.length} trees and {inspections.length} inspections on this device.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={backup} className="inline-flex items-center gap-2 rounded-lg bg-sky px-4 py-2 text-sm font-medium text-primary-foreground">
              <Download className="size-4" /> Download full backup
            </button>
            <button onClick={onReset} className="inline-flex items-center gap-2 rounded-lg border border-gold/50 bg-gold-soft px-4 py-2 text-sm font-medium text-gold">
              <RotateCcw className="size-4" /> Restore sample data
            </button>
          </div>
        </Card>
        <Card>
          <CardTitle>Recent sign-ins</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {recent.length === 0 && <li className="text-muted-foreground">No sign-ins yet.</li>}
            {recent.map((u) => (
              <li key={u.id} className="flex justify-between gap-3">
                <span>{u.fullName || u.email} {u.role ? <span className={`ml-1 rounded-full border px-2 py-0.5 text-xs ${ROLE_BADGE[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                <span className="whitespace-nowrap text-muted-foreground">{new Date(u.lastSignIn!).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
