import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer, FileText } from "lucide-react";
import { Card, CardTitle, DemoNote, PageHeader } from "@/components/ui-kit";
import { FRUIT_FARMS } from "@/lib/data";
import { downloadCSV, useStore } from "@/lib/store";

export const Route = createFileRoute("/_platform/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Tree360 Rwanda" },
      { name: "description", content: "Download tree inventory, inspection and fruit-farm reports (demonstration data)." },
      { property: "og:title", content: "Reports — Tree360 Rwanda" },
      { property: "og:description", content: "Export tree, inspection and farm summaries as CSV." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { trees, inspections } = useStore() as ReturnType<typeof useStore> & { inspections?: Record<string, unknown>[] };
  const byDistrict: Record<string, number> = {};
  trees.forEach((t) => (byDistrict[t.district] = (byDistrict[t.district] ?? 0) + 1));
  const reports = [
    { name: "Tree inventory", desc: `${trees.length} registered trees`, run: () => downloadCSV("tree-inventory.csv", trees as unknown as Record<string, unknown>[]) },
    { name: "Inspections", desc: `${inspections?.length ?? 0} inspection records`, run: () => downloadCSV("inspections.csv", (inspections ?? []) as Record<string, unknown>[]) },
    { name: "Fruit farms", desc: `${FRUIT_FARMS.length} farms and orchards`, run: () => downloadCSV("fruit-farms.csv", FRUIT_FARMS) },
    { name: "District summary", desc: `${Object.keys(byDistrict).length} districts`, run: () => downloadCSV("district-summary.csv", Object.entries(byDistrict).map(([district, trees]) => ({ district, trees }))) },
  ];
  return (
    <>
      <PageHeader
        title="Reports"
        sub="Download summaries to share or analyse."
        actions={<button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"><Printer className="size-4" /> Print</button>}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.name}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-primary" />
                <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.desc}</p></div>
              </div>
              <button onClick={r.run} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"><Download className="size-4" /> CSV</button>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardTitle>Trees by district</CardTitle>
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(byDistrict).map(([d, n]) => (
              <tr key={d} className="border-t"><td className="py-2">{d}</td><td className="text-right font-medium">{n}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <DemoNote />
    </>
  );
}
