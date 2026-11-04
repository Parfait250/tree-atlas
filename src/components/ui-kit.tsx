import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import type { Health } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border bg-card p-5 shadow-card", className)}>{children}</div>;
}

export function CardTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{children}</h3>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ icon: Icon, label, value, tone = "primary" }: { icon: LucideIcon; label: string; value: number | string; tone?: "primary" | "warning" | "destructive" | "info" }) {
  const tones = {
    primary: "bg-secondary text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  };
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={cn("grid size-11 shrink-0 place-items-center rounded-lg", tones[tone])}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </Card>
  );
}

export function HealthBadge({ health }: { health: Health | string }) {
  const map: Record<string, string> = {
    Healthy: "bg-secondary text-primary",
    "Needs attention": "bg-warning/15 text-warning-foreground",
    Critical: "bg-destructive/10 text-destructive",
    Dead: "bg-muted text-muted-foreground line-through",
  };
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", map[health])}>{health}</span>;
}

export function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>{children ?? "Demonstration data — illustrative figures, not actual statistics about Rwanda."}</span>
    </div>
  );
}

export const fieldCls =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";
