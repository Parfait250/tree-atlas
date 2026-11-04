import { createFileRoute, Link } from "@tanstack/react-router";
import { TreePine, HeartPulse, AlertTriangle, Skull, MapPin, ClipboardCheck, Activity } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area, Legend,
} from "recharts";
import { Card, CardTitle, DemoNote, PageHeader, Stat } from "@/components/ui-kit";
import { RegisterTreeButton } from "@/components/RegisterTree";
import { ACTIVITIES, MONTHLY_INSPECTIONS, SURVIVAL_TREND } from "@/lib/data";
import { useStore } from "@/lib/store";

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
