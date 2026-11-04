import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, MapPin, Stethoscope, X } from "lucide-react";
import { Card, DemoNote, HealthBadge, PageHeader, fieldCls } from "@/components/ui-kit";
import { RegisterTreeButton } from "@/components/RegisterTree";
import { Button } from "@/components/ui/button";
import { DISTRICTS, type Tree } from "@/lib/data";
import { downloadCSV, useStore } from "@/lib/store";

export const Route = createFileRoute("/_platform/inventory")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : undefined }),
  head: () => ({
    meta: [
      { title: "Tree Inventory — Tree360 Rwanda" },
      { name: "description", content: "Searchable inventory of registered urban and fruit trees with registration form." },
      { property: "og:title", content: "Tree Inventory — Tree360 Rwanda" },
      { property: "og:description", content: "Browse, filter, register and export tree records." },
    ],
  }),
  component: Inventory,
});

function Inventory() {
  const { q: initial } = Route.useSearch();
  const { trees, inspections } = useStore();
  const [q, setQ] = useState(initial ?? "");
  const [cat, setCat] = useState("");
  const [district, setDistrict] = useState("");
  const [health, setHealth] = useState("");
  const [sel, setSel] = useState<Tree | null>(null);
  useEffect(() => setQ(initial ?? ""), [initial]);

  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return trees.filter(
      (t) =>
        (!s || [t.id, t.species, t.location, t.district].some((v) => v.toLowerCase().includes(s))) &&
        (!cat || t.category === cat) && (!district || t.district === district) && (!health || t.health === health),
    );
  }, [trees, q, cat, district, health]);

  const exportCsv = () =>
    downloadCSV("tree360-inventory.csv", rows.map((t) => ({
      id: t.id, species: t.species, category: t.category, location: t.location, district: t.district, latitude: t.lat, longitude: t.lng,
      planted: t.plantedOn, height_m: t.height, diameter_cm: t.diameter, health: t.health, last_inspection: t.lastInspection,
    })));

  return (
    <>
      <PageHeader title="Tree inventory & registration" sub={`${trees.length} sample records`} actions={<><Button variant="outline" onClick={exportCsv} disabled={!rows.length}><Download className="size-4" /> Export CSV</Button><RegisterTreeButton /></>} />
      <DemoNote>All records are fictional examples for demonstration.</DemoNote>
      <Card className="p-0">
        <div className="grid gap-2 border-b p-4 sm:grid-cols-4">
          <input className={fieldCls} placeholder="Search ID, species, location…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={fieldCls} value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option><option value="Urban">Urban tree</option><option value="Fruit">Fruit tree</option></select>
          <select className={fieldCls} value={district} onChange={(e) => setDistrict(e.target.value)}><option value="">All districts</option>{DISTRICTS.map((d) => <option key={d.name}>{d.name}</option>)}</select>
          <select className={fieldCls} value={health} onChange={(e) => setHealth(e.target.value)}><option value="">All conditions</option><option>Healthy</option><option>Needs attention</option><option>Critical</option><option>Dead</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>{["Tree ID", "Species", "Category", "Location", "Planted", "Health", "Last inspection", "Actions"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No trees match your search.</td></tr>}
              {rows.map((t) => (
                <tr key={t.id} className="border-t hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-medium">{t.id}{t.isNew && <span className="ml-2 rounded-full bg-info/10 px-1.5 text-[10px] text-info">NEW</span>}</td>
                  <td className="px-4 py-2.5">{t.species}</td>
                  <td className="px-4 py-2.5">{t.category} tree</td>
                  <td className="px-4 py-2.5"><span className="block">{t.district}</span><span className="text-xs text-muted-foreground">{t.location}</span></td>
                  <td className="px-4 py-2.5 tabular-nums">{t.plantedOn}</td>
                  <td className="px-4 py-2.5"><HealthBadge health={t.health} /></td>
                  <td className="px-4 py-2.5 tabular-nums">{t.lastInspection}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setSel(t)}>View</Button>
                      <Button size="sm" variant="ghost" asChild><Link to="/map" search={{ focus: t.id }} aria-label="Show on map"><MapPin className="size-4" /></Link></Button>
                      <Button size="sm" variant="ghost" asChild><Link to="/inspections" search={{ tree: t.id }} aria-label="Inspect"><Stethoscope className="size-4" /></Link></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {sel && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={() => setSel(null)}>
          <aside className="h-full w-full max-w-md overflow-y-auto bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div><h2 className="text-lg font-semibold">{sel.id} · {sel.species}</h2><p className="text-xs text-muted-foreground">{sel.location}, {sel.district}</p></div>
              <button aria-label="Close" onClick={() => setSel(null)}><X className="size-5" /></button>
            </div>
            {sel.photo && <img src={sel.photo} alt={sel.species} className="mt-4 w-full rounded-lg" />}
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[["Category", `${sel.category} tree`], ["Health", <HealthBadge key="h" health={sel.health} />], ["GPS", `${sel.lat}, ${sel.lng}`], ["Planted", sel.plantedOn], ["Height", `${sel.height} m`], ["Trunk diameter", `${sel.diameter} cm`], ["Last inspection", sel.lastInspection]].map(([k, v]) => (
                <div key={k as string}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
            {sel.notes && <p className="mt-4 rounded-lg bg-muted p-3 text-sm">{sel.notes}</p>}
            <h3 className="mt-6 text-sm font-semibold">Inspection history</h3>
            <ul className="mt-2 space-y-2">
              {inspections.filter((i) => i.treeId === sel.id).sort((a, b) => b.date.localeCompare(a.date)).map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-lg border p-2.5 text-xs"><span>{i.date} · {i.inspector}</span><HealthBadge health={i.health} /></li>
              ))}
              {!inspections.some((i) => i.treeId === sel.id) && <li className="text-xs text-muted-foreground">No inspections recorded yet.</li>}
            </ul>
            <div className="mt-6 flex gap-2">
              <Button asChild><Link to="/inspections" search={{ tree: sel.id }}>Record inspection</Link></Button>
              <Button variant="outline" asChild><Link to="/map" search={{ focus: sel.id }}>Show on map</Link></Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
