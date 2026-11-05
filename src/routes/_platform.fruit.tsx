import { createFileRoute } from "@tanstack/react-router";
import { Apple, Sprout, Scale, MapPin } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardTitle, DemoNote, HealthBadge, PageHeader, Stat } from "@/components/ui-kit";
import { FRUIT_FARMS, PRODUCTION_TREND } from "@/lib/data";

export const Route = createFileRoute("/_platform/fruit")({
  head: () => ({
    meta: [
      { title: "Fruit Trees — Tree360 Rwanda" },
      { name: "description", content: "Fruit-tree farms, species, harvest seasons and production trends (demonstration data)." },
      { property: "og:title", content: "Fruit Trees — Tree360 Rwanda" },
      { property: "og:description", content: "Fruit farms, harvest seasons and yield trends across Rwanda." },
    ],
  }),
  component: Fruit,
});

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Fruit() {
  const total = FRUIT_FARMS.reduce((s, f) => s + f.trees, 0);
  const prod = FRUIT_FARMS.reduce((s, f) => s + f.production, 0);
  const species = Object.keys(PRODUCTION_TREND[0]).filter((k) => k !== "year");
  return (
    <>
      <PageHeader title="Fruit Trees" sub="Farms, cooperatives and orchards growing fruit trees." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Apple} label="Fruit trees" value={total.toLocaleString()} />
        <Stat icon={MapPin} label="Farms & sites" value={FRUIT_FARMS.length} tone="info" />
        <Stat icon={Sprout} label="Species" value={species.length} />
        <Stat icon={Scale} label="Production (t / yr)" value={prod.toFixed(1)} tone="warning" />
      </div>
      <Card className="mt-6">
        <CardTitle sub="Tonnes per year">Production trend</CardTitle>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={PRODUCTION_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              {species.map((s, i) => <Line key={s} dataKey={s} stroke={colors[i % 5]} strokeWidth={2} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="mt-6 overflow-x-auto">
        <CardTitle>Farms & harvest seasons</CardTitle>
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr><th className="py-2">Farm</th><th>District</th><th>Species</th><th>Trees</th><th>Age (yrs)</th><th>Health</th><th>t / yr</th><th>Harvest</th></tr>
          </thead>
          <tbody>
            {FRUIT_FARMS.map((f) => (
              <tr key={f.farm} className="border-t">
                <td className="py-2 font-medium">{f.farm}</td><td>{f.district}</td><td>{f.species}</td><td>{f.trees}</td><td>{f.age}</td>
                <td><HealthBadge health={f.health} /></td><td>{f.production}</td><td>{f.harvest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <DemoNote />
    </>
  );
}
