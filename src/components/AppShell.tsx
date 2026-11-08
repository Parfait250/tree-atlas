import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Map, TreePine, Stethoscope, Apple, BarChart3, FileText, Plug, Bell, Search, Menu, X, Leaf, LogOut, ShieldCheck,
} from "lucide-react";
import { useAuth, canAccess, ROLE_LABELS } from "@/lib/auth";
import { DISCLAIMER } from "@/lib/data";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/admin", label: "Admin Center", icon: ShieldCheck },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "GIS Tree Map", icon: Map },
  { to: "/inventory", label: "Tree Inventory", icon: TreePine },
  { to: "/inspections", label: "Health & Inspections", icon: Stethoscope },
  { to: "/fruit", label: "Fruit Trees", icon: Apple },
  { to: "/analytics", label: "Spatial Intelligence", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/integration", label: "Future Integration", icon: Plug },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Leaf className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-wide">TREE360</span>
        <span className="block text-[10px] tracking-[0.2em] opacity-70">RWANDA</span>
      </span>
    </Link>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [bell, setBell] = useState(false);
  const { stats } = useStore();
  const navigate = useNavigate();
  const { roles, fullName, signOut } = useAuth();
  const initials = fullName.split(/[\s@]/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "U";

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.filter(({ to }) => canAccess(roles, to)).map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent !text-sidebar-accent-foreground font-medium" }}
        >
          <Icon className="size-4" /> {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <Brand />
        {nav}
        <p className="mt-auto text-[10px] leading-relaxed opacity-60">Prototype · demonstration data only</p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col gap-8 bg-sidebar p-5 text-sidebar-foreground">
            <div className="flex items-center justify-between">
              <Brand />
              <button aria-label="Close menu" onClick={() => setOpen(false)}><X className="size-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur lg:px-8">
        <button aria-label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}><Menu className="size-5" /></button>
        <form
          className="relative max-w-md flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/inventory", search: { q } });
          }}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tree ID, species, location…"
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </form>
        <div className="relative ml-auto">
          <button aria-label="Notifications" onClick={() => setBell((b) => !b)} className="relative grid size-9 place-items-center rounded-lg hover:bg-muted">
            <Bell className="size-4" />
            {stats.needsInspection > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-warning" />}
          </button>
          {bell && (
            <div className="absolute right-0 top-11 w-72 rounded-xl border bg-popover p-4 text-sm shadow-card">
              <p className="font-medium">{stats.needsInspection} sample trees need follow-up</p>
              <Link to="/inspections" onClick={() => setBell(false)} className="mt-2 inline-block text-xs font-medium text-primary">View priority inspections →</Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">{initials}</span>
          <span className="hidden text-xs leading-tight sm:block"><b className="block max-w-40 truncate">{fullName}</b><span className="text-muted-foreground">{roles.map((r) => ROLE_LABELS[r]).join(", ")}</span></span>
          <button
            aria-label="Sign out"
            title="Sign out"
            onClick={async () => { await signOut(); navigate({ to: "/auth", replace: true }); }}
            className="grid size-9 place-items-center rounded-lg hover:bg-muted"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        <Outlet />
        <footer className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-foreground">Tree360 Rwanda</p>
              <p className="mt-1 text-xs leading-relaxed">Geospatial tree mapping and monitoring to support greener, more resilient communities across Rwanda.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Contact</p>
              <p className="mt-1 text-xs">Phone: <a href="tel:+250793737761" className="hover:text-primary">+250 793 737 761</a></p>
              <p className="text-xs">Address: Kigali, Rwanda</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Quick links</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
                <Link to="/map" className="hover:text-primary">Tree Map</Link>
                <Link to="/inventory" className="hover:text-primary">Inventory</Link>
                <Link to="/reports" className="hover:text-primary">Reports</Link>
              </div>
            </div>
          </div>
          <p className="mt-6 text-[11px] leading-relaxed">{DISCLAIMER}</p>
          <p className="mt-2 text-[11px]">© {new Date().getFullYear()} Tree360 Rwanda. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
