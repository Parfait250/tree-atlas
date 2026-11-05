import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { ClientMap } from "@/components/ClientMap";
import { Card, DemoNote, HealthBadge, PageHeader } from "@/components/ui-kit";
import { RegisterTreeButton } from "@/components/RegisterTree";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { Tree } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_platform/map")({
  validateSearch: (s: Record<string, unknown>): { focus?: string } => ({ focus: typeof s.focus === "string" ? s.focus : undefined }),
  head: () => ({
    meta: [
      { title: "GIS Tree Map — Tree360 Rwanda" },
      { name: "description", content: "Interactive map of illustrative tree locations across Kigali and Rwanda." },
      { property: "og:title", content: "GIS Tree Map — Tree360 Rwanda" },
      { property: "og:description", content: "Click any tree to see species, GPS, health and inspection history." },
    ],
  }),
  component: MapPage,
});

const FILTERS: { key: string; label: string; fn: (t: Tree) => boolean }[] = [
  { key: "all", label: "All trees", fn: () => true },
  { key: "urban", label: "Urban", fn: (t) => t.category === "Urban" },
  { key: "fruit", label: "Fruit", fn: (t) => t.category === "Fruit" },
  { key: "healthy", label: "Healthy", fn: (t) => t.health === "Healthy" },
  { key: "attention", label: "Need attention", fn: (t) => t.health === "Needs attention" || t.health === "Critical" },
  { key: "dead", label: "Dead", fn: (t) => t.health === "Dead" },
];

function MapPage() {
  const { focus } = Route.useSearch();
  const { trees } = useStore();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [focusId, setFocusId] = useState<string | null>(focus ?? null);
  const reset = useRef<() => void>(() => {});

  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!.fn;
    const s = q.toLowerCase();
    return trees.filter((t) => f(t) && (!s || [t.id, t.species, t.location, t.district].some((v) => v.toLowerCase().includes(s))));
  }, [trees, filter, q]);

  return (
    <>
      <PageHeader title="Interactive GIS tree map" sub="Kigali and selected Rwandan districts · OpenStreetMap" actions={<RegisterTreeButton onDone={(id) => setTimeout(() => setFocusId(id), 50)} />} />
      <DemoNote>Tree locations shown are illustrative sample points, not real registered trees.</DemoNote>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="relative p-2">
          <div className="h-[60vh] min-h-[420px] lg:h-[680px]">
            <ClientMap trees={shown} focusId={focusId} onReady={(r) => (reset.current = r)} />
          </div>
          <div className="absolute bottom-6 left-6 z-[400] rounded-lg bg-card/95 p-3 text-xs shadow-card">
            {[["var(--healthy)", "Healthy"], ["var(--warning)", "Requires attention"], ["var(--destructive)", "Dead / critical"], ["var(--info)", "Newly registered"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-2 py-0.5"><span className="size-2.5 rounded-full" style={{ background: c }} />{l}</div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="absolute right-5 top-[148px] z-[400] bg-card" onClick={() => { setFocusId(null); reset.current(); }}>
            <LocateFixed className="size-4" /> Reset view
          </Button>
        </Card>
        <Card className="flex flex-col p-4 lg:h-[696px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, species, location" className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={cn("rounded-full border px-2.5 py-1 text-xs", filter === f.key ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>{f.label}</button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{shown.length} trees shown</p>
          <ul className="mt-2 max-h-80 flex-1 space-y-1 overflow-y-auto lg:max-h-none">
            {shown.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">No trees match these filters.</li>}
            {shown.map((t) => (
              <li key={t.id}>
                <button onClick={() => setFocusId(t.id)} className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left hover:bg-muted", focusId === t.id && "bg-secondary")}>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{t.id} · {t.species}</span>
                    <span className="block truncate text-xs text-muted-foreground">{t.location}, {t.district}</span>
                  </span>
                  {t.isNew ? <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs font-medium text-info">New</span> : <HealthBadge health={t.health} />}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
