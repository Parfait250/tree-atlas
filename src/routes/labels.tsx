import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreeQR } from "@/components/TreeQR";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/labels")({
  validateSearch: (s: Record<string, unknown>): { ids?: string } => ({ ids: typeof s.ids === "string" ? s.ids : undefined }),
  head: () => ({
    meta: [
      { title: "Print QR Labels — Tree360 Rwanda" },
      { name: "description", content: "Printable sheet of unique QR labels for selected trees." },
      { property: "og:title", content: "Print QR Labels — Tree360 Rwanda" },
      { property: "og:description", content: "Printable sheet of unique QR labels for selected trees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Labels,
});

function Labels() {
  const { ids } = Route.useSearch();
  const { trees } = useStore();
  const { user, loading } = useAuth();
  const wanted = new Set((ids ?? "").split(",").filter(Boolean));
  const list = trees.filter((t) => wanted.has(t.id));

  if (loading) return null;
  if (!user) return <main className="p-6 text-center text-sm">Please <Link to="/auth" className="text-primary underline">sign in</Link> to print labels.</main>;

  return (
    <main className="mx-auto max-w-[210mm] p-4 print:p-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-lg font-semibold">QR labels · {list.length} trees</h1>
          <p className="text-xs text-muted-foreground">Tap Print, then choose "Save as PDF" to download one PDF.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/inventory">Back</Link></Button>
          <Button onClick={() => window.print()} disabled={!list.length}><Printer className="size-4" /> Print / Save PDF</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3 print:gap-2">
        {list.map((t) => (
          <div key={t.id} className="flex break-inside-avoid flex-col items-center rounded-lg border border-dashed p-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-primary">Tree360 Rwanda</div>
            <TreeQR id={t.id} size={120} className="my-1" />
            <div className="text-base font-bold">{t.id}</div>
            <div className="text-xs">{t.species}</div>
            <div className="text-[10px] text-muted-foreground">{t.district} · {t.location}</div>
          </div>
        ))}
      </div>
      {!list.length && <p className="text-center text-sm text-muted-foreground">No trees selected. Go back to Inventory and tick some trees.</p>}
    </main>
  );
}
