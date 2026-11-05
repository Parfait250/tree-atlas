import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Leaf, MapPin, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { Card, CardTitle, DemoNote, PageHeader, Stat } from "@/components/ui-kit";
import { SURVIVAL_TREND } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_platform/analytics")({
  head: () => ({
    meta: [
      { title: "Spatial Intelligence — Tree360 Rwanda" },
      { name: "description", content: "District distribution, survival trends and estimated carbon storage (demonstration data)." },
      { property: "og:title", content: "Spatial Intelligence — Tree360 Rwanda" },
      { property: "og:description", content: "Where trees are, how they survive, and what they store." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { trees, stats } = useStore();
  const byDistrict: Record<string, { district: string; healthy: number; other: number }> = {};
  trees.forEach((t) => {
    const d = (byDistrict[t.district] ??= { district: t.district, healthy: 0, other: 0 });
    if (t.health === "Healthy") d.healthy++; else d.other++;
  });
  const districts = Object.values(byDistrict);
  // Rough illustrative estimate: ~0.02 t CO2 stored per cm of diameter.
  const carbon = trees.reduce((s, t) => s + t.diameter * 0.02, 0);
  return (
    <>
      <PageHeader title="Spatial Intelligence" sub="Patterns across districts, survival over time and estimated carbon." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={MapPin} label="Districts covered" value={districts.length} tone="info" />
        <Stat icon={TrendingUp} label="Survival rate" value={`${SURVIVAL_TREND.at(-1)!.rate}%`} />
        <Stat icon={Leaf} label="Est. CO₂ stored (t)" value={carbon.toFixed(1)} />
        <Stat icon={Activity} label="Needing attention" value={stats.attention} tone="warning" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle sub="Registered trees per district">District distribution</CardTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={districts}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="district" fontSize={11} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="healthy" stackId="a" fill="var(--chart-1)" name="Healthy" />
                <Bar dataKey="other" stackId="a" fill="var(--chart-2)" name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle sub="Percent of planted trees surviving">Survival trend</CardTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={SURVIVAL_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis domain={[70, 100]} fontSize={12} />
                <Tooltip />
                <Area dataKey="rate" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.25} name="Survival %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <DemoNote />
    </>
  );
}
