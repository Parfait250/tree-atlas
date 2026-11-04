import { lazy, Suspense, Component, type ReactNode, type ComponentProps } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type TreeMapType from "./TreeMap";

const TreeMap = lazy(() => import("./TreeMap"));

function Fallback({ trees, label }: { trees: ComponentProps<typeof TreeMapType>["trees"]; label: string }) {
  // Simple projected fallback so the map never renders blank.
  return (
    <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-xl bg-secondary">
      {trees.map((t) => (
        <span
          key={t.id}
          title={`${t.id} ${t.species}`}
          className="absolute size-2 rounded-full bg-primary"
          style={{ left: `${((t.lng - 28.85) / 2.1) * 100}%`, top: `${((-1.05 - t.lat) / 1.8) * 100}%` }}
        />
      ))}
      <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
        <span className="flex items-center gap-2 rounded-md bg-card/90 px-3 py-1.5"><MapPin className="size-4" />{label}</span>
      </div>
    </div>
  );
}

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    return this.state.err ? this.props.fallback : this.props.children;
  }
}

export function ClientMap(props: ComponentProps<typeof TreeMapType>) {
  const loading = <Fallback trees={props.trees} label="Loading map…" />;
  return (
    <ClientOnly fallback={loading}>
      <Boundary fallback={<Fallback trees={props.trees} label="Map tiles unavailable — showing schematic view" />}>
        <Suspense fallback={loading}>
          <TreeMap {...props} />
        </Suspense>
      </Boundary>
    </ClientOnly>
  );
}
