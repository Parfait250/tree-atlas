import { createFileRoute, Link } from "@tanstack/react-router";
import { Map, ClipboardCheck, Apple, BarChart3, TreePine, LogIn, Users } from "lucide-react";
import hero from "@/assets/hero-rwanda.jpg";
import { DEMO_TARGET } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tree360 Rwanda — Geospatial tree mapping & monitoring" },
      { name: "description", content: "Tree360 Rwanda maps, monitors and reports on urban and fruit trees across Rwanda's districts. Sign in to explore the platform." },
      { property: "og:title", content: "Tree360 Rwanda — Geospatial tree mapping & monitoring" },
      { property: "og:description", content: "Map, inspect and report on trees across Rwanda in one platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const PILLARS = [
  { icon: Map, title: "GIS tree mapping", text: "Every tree tagged with GPS and shown on an interactive map of Rwanda's districts." },
  { icon: ClipboardCheck, title: "Health & inspections", text: "Field officers log inspections, flag pests and track survival over time." },
  { icon: Apple, title: "Fruit & agroforestry", text: "Farm registries, harvest seasons and production trends for fruit species." },
  { icon: BarChart3, title: "Analytics & reports", text: "Survival rates, carbon estimates and downloadable reports for decision makers." },
];

const ROLES = [
  ["Field Officers", "Register trees and record inspections in the field."],
  ["Ministry Officials", "Follow national indicators and download reports."],
  ["Researchers & Partners", "Explore maps, analytics and full datasets."],
  ["Administrators", "Oversee the entire platform and its users."],
];

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 font-bold"><TreePine className="size-6 text-primary" />Tree360 Rwanda</div>
        <Link to="/auth" className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"><LogIn className="size-4" />Sign in</Link>
      </header>

      <section className="relative">
        <img src={hero} alt="Green hills of Rwanda" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 to-foreground/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28 text-background">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Geospatial tree intelligence</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">Mapping and caring for every tree across Rwanda</h1>
          <p className="mt-4 max-w-xl text-base opacity-90 sm:text-lg">Tree360 brings tree registration, health inspections, fruit production and national analytics together in one platform for a greener, more resilient Rwanda.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:opacity-90"><LogIn className="size-4" />Sign in or try the demo</Link>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4">
          {[["8", "Districts covered"], [DEMO_TARGET.total.toLocaleString(), "Trees registered"], [DEMO_TARGET.inspections.toLocaleString(), "Inspections logged"], [`${Math.round((DEMO_TARGET.healthy / DEMO_TARGET.total) * 100)}%`, "Healthy trees"]].map(([v, l]) => (
            <div key={l}><p className="text-2xl font-bold text-primary">{v}</p><p className="text-sm text-muted-foreground">{l}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">What the system does</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border bg-card p-5">
              <Icon className="size-8 text-primary" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"><Users className="size-7 text-primary" />Built for everyone involved</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {ROLES.map(([t, d]) => (
            <div key={t} className="rounded-lg border p-4"><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to explore Tree360?</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">Sign in with your account, create a new one, or try the demo instantly as a field officer, official, researcher or administrator.</p>
          <Link to="/auth" className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-background px-6 font-medium text-foreground hover:opacity-90"><LogIn className="size-4" />Sign in now</Link>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Tree360 Rwanda · Kigali, Rwanda · <a href="tel:+250793737761" className="hover:underline">+250 793 737 761</a>
      </footer>
    </div>
  );
}
