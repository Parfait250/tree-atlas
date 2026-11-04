import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEMO_TARGET, SEED_INSPECTIONS, SEED_TREES, type Inspection, type Tree } from "./data";

// Local data layer (localStorage). Swap these functions for a backend later.
const KEY = "tree360.v1";

interface Store {
  trees: Tree[];
  inspections: Inspection[];
  addTree: (t: Tree) => void;
  addInspection: (i: Inspection) => void;
  nextId: () => string;
  reset: () => void;
  stats: typeof DEMO_TARGET & { needsInspection: number };
}

const Ctx = createContext<Store | null>(null);

function count(trees: Tree[]) {
  return {
    total: trees.length,
    healthy: trees.filter((t) => t.health === "Healthy").length,
    attention: trees.filter((t) => t.health === "Needs attention" || t.health === "Critical").length,
    dead: trees.filter((t) => t.health === "Dead").length,
  };
}
const seedCount = count(SEED_TREES);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [trees, setTrees] = useState<Tree[]>(SEED_TREES);
  const [inspections, setInspections] = useState<Inspection[]>(SEED_INSPECTIONS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.trees)) setTrees(d.trees);
        if (Array.isArray(d.inspections)) setInspections(d.inspections);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ trees, inspections }));
    } catch {
      /* storage full (large photos) */
    }
  }, [trees, inspections, loaded]);

  const value = useMemo<Store>(() => {
    const c = count(trees);
    // Headline demo figures = baseline (unlisted records) + live sample records.
    const stats = {
      total: DEMO_TARGET.total - seedCount.total + c.total,
      healthy: DEMO_TARGET.healthy - seedCount.healthy + c.healthy,
      attention: DEMO_TARGET.attention - seedCount.attention + c.attention,
      dead: DEMO_TARGET.dead - seedCount.dead + c.dead,
      locations: DEMO_TARGET.locations,
      inspections: DEMO_TARGET.inspections - SEED_INSPECTIONS.length + inspections.length,
      needsInspection: trees.filter((t) => t.health === "Needs attention" || t.health === "Critical").length,
    };
    return {
      trees,
      inspections,
      stats,
      addTree: (t) => setTrees((p) => [t, ...p]),
      addInspection: (i) => {
        setInspections((p) => [...p, i]);
        setTrees((p) =>
          p.map((t) =>
            t.id === i.treeId
              ? { ...t, health: i.health, height: i.height, diameter: i.diameter, lastInspection: i.date, isNew: false }
              : t,
          ),
        );
      },
      nextId: () => {
        const max = trees.reduce((m, t) => Math.max(m, parseInt(t.id.slice(3)) || 0), 0);
        return `TR-${String(max + 1).padStart(4, "0")}`;
      },
      reset: () => {
        setTrees(SEED_TREES);
        setInspections(SEED_INSPECTIONS);
      },
    };
  }, [trees, inspections]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}

export function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

export function downloadCSV(name: string, rows: Record<string, unknown>[]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
