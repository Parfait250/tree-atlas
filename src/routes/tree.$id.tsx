import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Lock, MapPin, Stethoscope } from "lucide-react";
import { Card, HealthBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { TreeQR } from "@/components/TreeQR";
import { useStore } from "@/lib/store";
import { canAccess, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/tree/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Tree ${params.id} — Tree360 Rwanda` },
      { name: "description", content: `Digital tree passport for ${params.id} in the Tree360 Rwanda registry.` },
      { property: "og:title", content: `Tree ${params.id} — Tree360 Rwanda` },
      { property: "og:description", content: "Scan-to-view tree profile: species, location, health and history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TreeProfile,
});

function TreeProfile() {
  const { id } = Route.useParams();
  const { trees, inspections } = useStore();
  const { user, roles, loading } = useAuth();
  const t = trees.find((x) => x.id === id);

  if (!t) {
    return (
      <main className="mx-auto max-w-md p-6 text-center">
        <h1 className="text-xl font-semibold">Tree not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">No tree with ID {id} is registered.</p>
        <Button asChild className="mt-4"><Link to="/">Go to Tree360</Link></Button>
      </main>
    );
  }

  const signedIn = !!user && !loading;
  const history = inspections.filter((i) => i.treeId === t.id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center gap-2 text-sm font-semibold text-primary"><Leaf className="size-4" /> Tree360 Rwanda · Tree passport</header>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{t.species}</h1>
            <p className="text-sm text-muted-foreground">{t.id} · {t.category} tree</p>
            <p className="mt-1 flex items-center gap-1 text-sm"><MapPin className="size-3.5" />{t.location}, {t.district}</p>
          </div>
          <TreeQR id={t.id} size={72} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-xs text-muted-foreground">Health</dt><dd><HealthBadge health={t.health} /></dd></div>
          <div><dt className="text-xs text-muted-foreground">Planted</dt><dd className="font-medium">{t.plantedOn}</dd></div>
          {signedIn && <>
            <div><dt className="text-xs text-muted-foreground">Height</dt><dd className="font-medium">{t.height} m</dd></div>
            <div><dt className="text-xs text-muted-foreground">Trunk diameter</dt><dd className="font-medium">{t.diameter} cm</dd></div>
            <div><dt className="text-xs text-muted-foreground">GPS</dt><dd className="font-medium">{t.lat}, {t.lng}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Last inspection</dt><dd className="font-medium">{t.lastInspection}</dd></div>
          </>}
        </dl>
      </Card>

      {!signedIn ? (
        <Card className="flex items-center gap-3 p-4 text-sm">
          <Lock className="size-5 text-muted-foreground" />
          <div className="flex-1">Sign in to see full measurements, inspection history and field actions.</div>
          <Button size="sm" asChild><Link to="/auth">Sign in</Link></Button>
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <h2 className="text-sm font-semibold">Inspection history</h2>
            <ul className="mt-2 space-y-2">
              {history.map((i) => <li key={i.id} className="flex items-center justify-between rounded-lg border p-2.5 text-xs"><span>{i.date} · {i.inspector}</span><HealthBadge health={i.health} /></li>)}
              {!history.length && <li className="text-xs text-muted-foreground">No inspections recorded yet.</li>}
            </ul>
          </Card>
          <div className="flex flex-wrap gap-2">
            {canAccess(roles, "/inspections") && <Button asChild><Link to="/inspections" search={{ tree: t.id }}><Stethoscope className="size-4" /> Record inspection</Link></Button>}
            {canAccess(roles, "/map") && <Button variant="outline" asChild><Link to="/map" search={{ focus: t.id }}>Show on map</Link></Button>}
          </div>
        </>
      )}
    </main>
  );
}
