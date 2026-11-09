import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Globe, Satellite, Cpu, Smartphone, Database, Plug, Download, Copy, Check, Play } from "lucide-react";
import { Card, DemoNote, PageHeader } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { DISTRICTS } from "@/lib/data";
import { downloadText, filterTrees, summarize, toGeoJSON } from "@/lib/geojson";

export const Route = createFileRoute("/_platform/integration")({
  head: () => ({
    meta: [
      { title: "GIS Export & Integration — Tree360 Rwanda" },
      { name: "description", content: "Download live tree data as GeoJSON for QGIS and ArcGIS, and try the open data API." },
      { property: "og:title", content: "GIS Export & Integration — Tree360 Rwanda" },
      { property: "og:description", content: "Live GeoJSON export and open data API sandbox for Tree360 Rwanda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Integration,
});

const HEALTH = ["Healthy", "Needs attention", "Critical", "Dead"];
const sel = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

const ITEMS = [
  { icon: Globe, name: "National GIS platforms", status: "Live", live: true },
  { icon: Plug, name: "Open data API", status: "Sandbox", live: true },
  { icon: Satellite, name: "Satellite imagery", status: "Planned" },
  { icon: Cpu, name: "Soil & weather sensors", status: "Concept" },
  { icon: Smartphone, name: "Field mobile app", status: "In design" },
  { icon: Database, name: "Government data systems", status: "Concept" },
];

function Integration() {
  const { trees } = useStore();
  const [district, setDistrict] = useState("");
  const [health, setHealth] = useState("");
  const [copied, setCopied] = useState(false);
  const filtered = useMemo(() => filterTrees(trees, { district, health }), [trees, district, health]);
  const geo = useMemo(() => JSON.stringify(toGeoJSON(filtered), null, 2), [filtered]);

  const [endpoint, setEndpoint] = useState<"trees" | "summary">("trees");
  const [apiDistrict, setApiDistrict] = useState("");
  const [apiHealth, setApiHealth] = useState("");
  const [resp, setResp] = useState<{ body: string; ms: number; size: number } | null>(null);
  const query = [apiDistrict && `district=${apiDistrict}`, apiHealth && `health=${encodeURIComponent(apiHealth)}`].filter(Boolean).join("&");
  const url = `/api/v1/${endpoint === "trees" ? "trees.geojson" : "trees/summary"}${query ? `?${query}` : ""}`;

  function run() {
    const t0 = performance.now();
    const rows = filterTrees(trees, { district: apiDistrict, health: apiHealth });
    const body = JSON.stringify(endpoint === "trees" ? toGeoJSON(rows) : summarize(rows), null, 2);
    setResp({ body, ms: Math.max(1, Math.round(performance.now() - t0 + 40 + Math.random() * 60)), size: body.length });
  }

  const name = `tree360_${district || "rwanda"}${health ? "_" + health.replace(/\s/g, "-") : ""}.geojson`.toLowerCase();

  return (
    <>
      <PageHeader title="GIS Export & Integration" sub="Share live tree data with mapping tools and partners." />

      <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ITEMS.map(({ icon: Icon, name: n, status, live }) => (
          <div key={n} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
            <Icon className={`size-4 shrink-0 ${live ? "text-primary" : "text-muted-foreground"}`} />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{n}</p>
              <p className={`text-[11px] ${live ? "text-primary" : "text-muted-foreground"}`}>{status}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Live GeoJSON export</h2>
          <p className="mt-1 text-sm text-muted-foreground">Opens directly in QGIS, ArcGIS Pro and Google Earth (WGS 84).</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-muted-foreground">District
              <select className={sel} value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="">All districts</option>
                {DISTRICTS.map((d) => <option key={d.name}>{d.name}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">Health
              <select className={sel} value={health} onChange={(e) => setHealth(e.target.value)}>
                <option value="">All conditions</option>
                {HEALTH.map((h) => <option key={h}>{h}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-4 text-sm"><b>{filtered.length}</b> trees · {(geo.length / 1024).toFixed(1)} KB</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button disabled={!filtered.length} onClick={() => downloadText(name, geo, "application/geo+json")}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              <Download className="size-4" /> Download GeoJSON
            </button>
            <button onClick={async () => { await navigator.clipboard.writeText(geo); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="mt-4 max-h-72 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">{geo.slice(0, 4000)}{geo.length > 4000 ? "\n…" : ""}</pre>
        </Card>

        <Card>
          <h2 className="font-semibold">Open data API sandbox</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try how partners and researchers would query Tree360.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-muted-foreground">Endpoint
              <select className={sel} value={endpoint} onChange={(e) => setEndpoint(e.target.value as "trees" | "summary")}>
                <option value="trees">Trees (GeoJSON)</option>
                <option value="summary">Summary</option>
              </select>
            </label>
            <label className="text-xs text-muted-foreground">district
              <select className={sel} value={apiDistrict} onChange={(e) => setApiDistrict(e.target.value)}>
                <option value="">—</option>
                {DISTRICTS.map((d) => <option key={d.name}>{d.name}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">health
              <select className={sel} value={apiHealth} onChange={(e) => setApiHealth(e.target.value)}>
                <option value="">—</option>
                {HEALTH.map((h) => <option key={h}>{h}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2 font-mono text-xs">
            <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground">GET</span>
            <span className="truncate">{url}</span>
          </div>
          <button onClick={run} className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Play className="size-4" /> Send request
          </button>
          {resp && (
            <>
              <p className="mt-4 text-xs text-muted-foreground"><span className="font-semibold text-primary">200 OK</span> · {resp.ms} ms · {(resp.size / 1024).toFixed(1)} KB</p>
              <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">{resp.body.slice(0, 4000)}{resp.body.length > 4000 ? "\n…" : ""}</pre>
            </>
          )}
        </Card>
      </div>
      <DemoNote />
    </>
  );
}
