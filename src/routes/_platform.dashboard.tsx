import { createFileRoute, Link } from "@tanstack/react-router";
import { TreePine, HeartPulse, AlertTriangle, Skull, MapPin, ClipboardCheck, Activity, Download } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area, Legend,
} from "recharts";
import { Card, CardTitle, DemoNote, PageHeader, Stat } from "@/components/ui-kit";
import { RegisterTreeButton } from "@/components/RegisterTree";
import { ACTIVITIES, MONTHLY_INSPECTIONS, SURVIVAL_TREND } from "@/lib/data";
import { useStore, downloadCSV } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_platform/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Tree360 Rwanda" },
      { name: "description", content: "Geospatial overview of registered urban and fruit trees (demonstration data)." },
      { property: "og:title", content: "Dashboard — Tree360 Rwanda" },
      { property: "og:description", content: "Tree health, species, inspections and survival at a glance." },
    ],
  }),
  component: Dashboard,
});

function RolePanel() {
  const { roles, fullName } = useAuth();
  const { trees, stats, inspections } = useStore();
  const first = fullName.split(" ")[0] || "there";
  const box = "mb-6 rounded-2xl border bg-card p-5 shadow-card";
  const btn = "inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground";
  const btn2 = "inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium hover:bg-muted";

  if (roles.includes("admin")) {
    return (
      <div className={box}>
        <p className="text-sm font-semibold">Administrator overview — hello {first}</p>
        <p className="mt-1 text-sm text-muted-foreground">You have access to all 8 modules. {stats.total} trees, {stats.inspections} inspections and {stats.locations} locations on the platform.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/reports" className={btn2}>Reports</Link>
          <Link to="/analytics" className={btn2}>Analytics</Link>
          <Link to="/integration" className={btn2}>Integrations</Link>
        </div>
      </div>
    );
  }
  if (roles.includes("ministry_official")) {
    const survival = SURVIVAL_TREND[SURVIVAL_TREND.length - 1]?.rate ?? 0;
    return (
      <div className={box}>
        <p className="text-sm font-semibold">Executive summary — welcome {first}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
          <div><p className="text-xs text-muted-foreground">Registered trees</p><p className="text-lg font-bold">{stats.total}</p></div>
          <div><p className="text-xs text-muted-foreground">Survival rate</p><p className="text-lg font-bold">{survival}%</p></div>
          <div><p className="text-xs text-muted-foreground">Est. CO₂ stored</p><p className="text-lg font-bold">{Math.round(stats.healthy * 0.022 * 10) / 10} t</p></div>
          <div><p className="text-xs text-muted-foreground">Need attention</p><p className="text-lg font-bold">{stats.attention}</p></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/reports" className={btn}><Download className="size-4" />Download executive report</Link>
          <Link to="/analytics" className={btn2}>National analytics</Link>
        </div>
      </div>
    );
  }
  if (roles.includes("researcher")) {
    const species = new Set(trees.map((t) => t.species)).size;
    const fruit = trees.filter((t) => t.category !== "Urban").length;
    return (
      <div className={box}>
        <p className="text-sm font-semibold">Research workspace — welcome {first}</p>
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
          <div><p className="text-xs text-muted-foreground">Species recorded</p><p className="text-lg font-bold">{species}</p></div>
          <div><p className="text-xs text-muted-foreground">Urban : fruit</p><p className="text-lg font-bold">{trees.length - fruit} : {fruit}</p></div>
          <div><p className="text-xs text-muted-foreground">Inspections</p><p className="text-lg font-bold">{stats.inspections}</p></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className={btn} onClick={() => downloadCSV("tree360-dataset.csv", trees as unknown as Record<string, unknown>[])}><Download className="size-4" />Export full dataset (CSV)</button>
          <Link to="/analytics" className={btn2}>Spatial analytics</Link>
        </div>
      </div>
    );
  }
  // Field officer
  const urgent = trees.filter((t) => t.health === "Critical" || t.health === "Needs attention").slice(0, 4);
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = inspections.filter((i) => new Date(i.date).getTime() >= weekAgo).length;
  const goal = 20;
  return (
    <div className={box}>
      <p className="text-sm font-semibold">Today's field work — hello {first}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <RegisterTreeButton />
        <Link to="/inspections" className={btn2}><ClipboardCheck className="size-4" />New inspection</Link>
      </div>
      <div className="mt-4">
        <p className="text-xs text-muted-foreground">Inspections this week: {thisWeek} / {goal}</p>
        <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (thisWeek / goal) * 100)}%` }} /></div>
      </div>
      {urgent.length > 0 && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Priority trees</p>
          <ul className="space-y-1 text-sm">
            {urgent.map((t) => (
              <li key={t.id}><Link to="/inspections" search={{ tree: t.id }} className="text-primary">{t.id}</Link> — {t.species}, {t.location} ({t.health})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const tip = { contentStyle: { borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 } };

function Dashboard() {
  const { stats, trees } = useStore();
  const health = [
    { name: "Healthy", value: stats.healthy, c: "var(--chart-1)" },
    { name: "Requiring attention", value: stats.attention, c: "var(--chart-2)" },
    { name: "Dead", value: stats.dead, c: "var(--chart-3)" },
  ];
  const speciesMap: Record<string, number> = {};
  trees.forEach((t) => (speciesMap[t.species] = (speciesMap[t.species] ?? 0) + 1));
  const species = Object.entries(speciesMap).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n).slice(0, 8);
  const urban = trees.filter((t) => t.category === "Urban").length;
  const share = urban / trees.length;
  const types = [
    { name: "Urban", value: Math.round(stats.total * share), c: "var(--chart-1)" },
    { name: "Fruit", value: stats.total - Math.round(stats.total * share), c: "var(--chart-2)" },
  ];
  const recent = trees.filter((t) => t.isNew).slice(0, 3).map((t) => ({ text: `New ${t.species.toLowerCase()} tree registered (${t.id})`, place: `${t.location}, ${t.district}`, date: t.lastInspection }));

  return (
    <>
      <PageHeader title="Welcome to Tree360 Rwanda" sub="Your geospatial overview of registered urban and fruit trees." actions={<RegisterTreeButton />} />
      <DemoNote />
      <RolePanel />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat icon={TreePine} label="Total registered trees" value={stats.total} />
        <Stat icon={HeartPulse} label="Healthy trees" value={stats.healthy} />
        <Stat icon={AlertTriangle} label="Trees requiring attention" value={stats.attention} tone="warning" />
        <Stat icon={Skull} label="Dead trees" value={stats.dead} tone="destructive" />
        <Stat icon={MapPin} label="Registered locations" value={stats.locations} tone="info" />
        <Stat icon={ClipboardCheck} label="Tree inspections completed" value={stats.inspections} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle sub="Share of all registered trees">Tree health distribution</CardTitle>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={health} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {health.map((h) => <Cell key={h.name} fill={h.c} />)}
                </Pie>
                <Tooltip {...tip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardTitle sub="Sample records in the inventory">Tree species distribution</CardTitle>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={species}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="n" name="Trees" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardTitle sub="2026">Monthly tree inspections</CardTitle>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={MONTHLY_INSPECTIONS}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip {...tip} />
                <Area dataKey="inspections" stroke="var(--chart-1)" fill="var(--chart-4)" fillOpacity={0.3} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle sub="Estimated split">Urban vs fruit trees</CardTitle>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={types} dataKey="value" outerRadius={85}>
                  {types.map((h) => <Cell key={h.name} fill={h.c} />)}
                </Pie>
                <Tooltip {...tip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle sub="% of planted trees surviving">Tree survival trend</CardTitle>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={SURVIVAL_TREND}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis domain={[75, 95]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip {...tip} />
                <Line dataKey="rate" name="Survival" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <CardTitle sub="Demo activity">Recent activities</CardTitle>
            <Link to="/map" className="text-xs font-medium text-primary">Open map →</Link>
          </div>
          <ol className="relative space-y-4 border-l pl-5">
            {[...recent, ...ACTIVITIES].slice(0, 6).map((a, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[27px] top-0.5 grid size-4 place-items-center rounded-full bg-secondary"><Activity className="size-2.5 text-primary" /></span>
                <p className="text-sm font-medium">{a.text}</p>
                <p className="text-xs text-muted-foreground">{a.place} · {a.date}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
