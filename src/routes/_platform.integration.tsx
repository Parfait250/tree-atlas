import { createFileRoute } from "@tanstack/react-router";
import { Globe, Satellite, Cpu, Smartphone, Database, Plug } from "lucide-react";
import { Card, DemoNote, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/_platform/integration")({
  head: () => ({
    meta: [
      { title: "Future Integration — Tree360 Rwanda" },
      { name: "description", content: "Planned connections with GIS, satellite imagery, sensors and national systems." },
      { property: "og:title", content: "Future Integration — Tree360 Rwanda" },
      { property: "og:description", content: "How Tree360 could connect with GIS, satellites, sensors and mobile apps." },
    ],
  }),
  component: Integration,
});

const ITEMS = [
  { icon: Globe, name: "National GIS platforms", desc: "Share tree locations as GeoJSON or Shapefile with mapping agencies.", status: "Planned" },
  { icon: Satellite, name: "Satellite imagery", desc: "Track canopy cover and land change from regular satellite images.", status: "Planned" },
  { icon: Cpu, name: "Soil & weather sensors", desc: "Live moisture and temperature readings to guide watering.", status: "Concept" },
  { icon: Smartphone, name: "Field mobile app", desc: "Offline tree registration and inspections for field officers.", status: "In design" },
  { icon: Database, name: "Government data systems", desc: "Exchange records with forestry and agriculture databases.", status: "Concept" },
  { icon: Plug, name: "Open data API", desc: "Let partners and researchers access anonymised tree data.", status: "Planned" },
];

function Integration() {
  return (
    <>
      <PageHeader title="Future Integration" sub="Connections planned for the next phases of Tree360 Rwanda." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ icon: Icon, name, desc, status }) => (
          <Card key={name}>
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{status}</span>
            </div>
            <p className="mt-4 font-medium">{name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </Card>
        ))}
      </div>
      <DemoNote />
    </>
  );
}
