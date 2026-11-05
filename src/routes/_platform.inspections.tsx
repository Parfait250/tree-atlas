import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, ClipboardPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardTitle, DemoNote, HealthBadge, PageHeader, fieldCls } from "@/components/ui-kit";
import { Field, readPhoto } from "@/components/RegisterTree";
import { Button } from "@/components/ui/button";
import { HEALTH_COLOR, type Health } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_platform/inspections")({
  validateSearch: (s: Record<string, unknown>): { tree?: string } => ({ tree: typeof s.tree === "string" ? s.tree : undefined }),
  head: () => ({
    meta: [
      { title: "Health & Inspections — Tree360 Rwanda" },
      { name: "description", content: "Record field inspections and follow tree health over time." },
      { property: "og:title", content: "Health & Inspections — Tree360 Rwanda" },
      { property: "og:description", content: "Inspection forms, condition timelines and priority inspections." },
    ],
  }),
  component: Inspections,
});

const HEALTHS: Health[] = ["Healthy", "Needs attention", "Critical", "Dead"];

function Inspections() {
  const { tree: initial } = Route.useSearch();
  const { trees, inspections, addInspection } = useStore();
  const [treeId, setTreeId] = useState(initial ?? trees[0]?.id ?? "");
  useEffect(() => { if (initial) setTreeId(initial); }, [initial]);
  const tree = trees.find((t) => t.id === treeId);

  const today = new Date().toISOString().slice(0, 10);
  const blank = { date: today, health: "Healthy" as Health, height: "", diameter: "", pests: "", maintenance: "", observations: "", inspector: "Field Officer" };
  const [f, setF] = useState(blank);
  const [photo, setPhoto] = useState<File>();
  const [err, setErr] = useState<Record<string, string>>({});
  useEffect(() => { if (tree) setF({ ...blank, health: tree.health, height: String(tree.height), diameter: String(tree.diameter) }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeId]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const history = useMemo(() => inspections.filter((i) => i.treeId === treeId).sort((a, b) => a.date.localeCompare(b.date)), [inspections, treeId]);
  const priority = trees.filter((t) => t.health === "Critical" || t.health === "Needs attention").sort((a, b) => (a.health === "Critical" ? -1 : 1) - (b.health === "Critical" ? -1 : 1) || a.lastInspection.localeCompare(b.lastInspection));
  const overdue = trees.filter((t) => t.health !== "Dead" && t.lastInspection < "2026-05-01").slice(0, 8);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!tree) er.tree = "Select a tree";
    if (!f.date) er.date = "Required";
    if (!(parseFloat(f.height) > 0)) er.height = "Enter height";
    if (!(parseFloat(f.diameter) > 0)) er.diameter = "Enter diameter";
    if (!f.observations.trim()) er.observations = "Add observations";
    setErr(er);
    if (Object.keys(er).length || !tree) return;
    addInspection({
      id: `IN-${tree.id}-${Date.now()}`, treeId: tree.id, date: f.date, health: f.health, height: parseFloat(f.height), diameter: parseFloat(f.diameter),
      pests: f.pests || "None observed", maintenance: f.maintenance || "None", observations: f.observations.trim(), inspector: f.inspector, photo: await readPhoto(photo),
    });
    toast.success(`Inspection saved — ${tree.id} is now "${f.health}"`);
    setF({ ...f, observations: "", pests: "", maintenance: "" });
  };

  return (
    <>
      <PageHeader title="Tree health & inspection monitoring" sub="Field observations and professional assessment — no automated diagnosis." />
      <DemoNote />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle sub="Updates the tree's health status everywhere in the platform">Record a new inspection</CardTitle>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Tree" req error={err.tree}>
              <select className={fieldCls} value={treeId} onChange={(e) => setTreeId(e.target.value)}>
                {trees.map((t) => <option key={t.id} value={t.id}>{t.id} · {t.species} · {t.district}</option>)}
              </select>
            </Field>
            <Field label="Inspection date" req error={err.date}><input type="date" className={fieldCls} value={f.date} onChange={set("date")} /></Field>
            <div className="sm:col-span-2">
              <span className="text-xs font-medium">Health condition <span className="text-destructive">*</span></span>
              <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {HEALTHS.map((h) => (
                  <button type="button" key={h} onClick={() => setF({ ...f, health: h })} className={cn("rounded-lg border px-3 py-2 text-xs font-medium", f.health === h ? "border-primary bg-secondary text-primary ring-2 ring-primary/30" : "hover:bg-muted")}>{h}</button>
                ))}
              </div>
            </div>
            <Field label="Tree height (m)" req error={err.height}><input className={fieldCls} value={f.height} onChange={set("height")} inputMode="decimal" /></Field>
            <Field label="Trunk diameter (cm)" req error={err.diameter}><input className={fieldCls} value={f.diameter} onChange={set("diameter")} inputMode="decimal" /></Field>
            <Field label="Visible pest / disease symptoms"><input className={fieldCls} value={f.pests} onChange={set("pests")} placeholder="None observed" /></Field>
            <Field label="Watering / maintenance needs"><input className={fieldCls} value={f.maintenance} onChange={set("maintenance")} placeholder="e.g. Pruning required" /></Field>
            <Field label="Inspector"><input className={fieldCls} value={f.inspector} onChange={set("inspector")} /></Field>
            <Field label="Photograph"><input type="file" accept="image/*" className="text-xs" onChange={(e) => setPhoto(e.target.files?.[0])} /></Field>
            <div className="sm:col-span-2"><Field label="Inspector's observations" req error={err.observations}><textarea className={fieldCls + " h-20 py-2"} value={f.observations} onChange={set("observations")} /></Field></div>
            <div className="sm:col-span-2 flex justify-end"><Button type="submit"><ClipboardPlus className="size-4" /> Save inspection</Button></div>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle sub={tree ? `${tree.id} · ${tree.species} · ${tree.location}` : ""}>Inspection history</CardTitle>
          {history.length > 0 && (
            <div className="mb-5 flex h-2 overflow-hidden rounded-full">
              {history.map((i) => <span key={i.id} className="flex-1" style={{ background: HEALTH_COLOR[i.health] }} title={`${i.date}: ${i.health}`} />)}
            </div>
          )}
          <ol className="relative space-y-4 border-l pl-5">
            {history.length === 0 && <li className="text-sm text-muted-foreground">No inspections yet for this tree.</li>}
            {[...history].reverse().map((i) => (
              <li key={i.id} className="relative">
                <span className="absolute -left-[26px] top-1 size-3 rounded-full ring-4 ring-card" style={{ background: HEALTH_COLOR[i.health] }} />
                <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium tabular-nums">{i.date}</span><HealthBadge health={i.health} /></div>
                <p className="text-xs text-muted-foreground">{i.height} m · {i.diameter} cm · {i.inspector}</p>
                <p className="mt-1 text-xs">Pests: {i.pests} · Maintenance: {i.maintenance}</p>
                <p className="text-xs italic text-muted-foreground">"{i.observations}"</p>
                {i.photo && <img src={i.photo} alt="Inspection" className="mt-2 h-20 rounded-md" />}
              </li>
            ))}
          </ol>
        </Card>

        <Card className="lg:col-span-3">
          <CardTitle sub="Trees in critical condition or requiring attention">
            <span className="flex items-center gap-2"><AlertTriangle className="size-4 text-warning" /> Priority Inspections</span>
          </CardTitle>
          <ul className="divide-y">
            {priority.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No priority trees right now.</li>}
            {priority.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0"><p className="text-sm font-medium">{t.id} · {t.species}</p><p className="truncate text-xs text-muted-foreground">{t.location}, {t.district} · last {t.lastInspection}</p></div>
                <div className="flex items-center gap-2"><HealthBadge health={t.health} /><Button size="sm" variant="outline" onClick={() => { setTreeId(t.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Inspect</Button></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-2">
          <CardTitle sub="Last inspected before May 2026">Due for routine inspection</CardTitle>
          <ul className="divide-y">
            {overdue.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                <span>{t.id} · {t.species}</span>
                <button className="text-xs font-medium text-primary" onClick={() => { setTreeId(t.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{t.lastInspection} →</button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
