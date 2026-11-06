import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth, canAccess, ROLE_LABELS } from "@/lib/auth";

export const Route = createFileRoute("/_platform")({
  ssr: false,
  component: Gate,
});

function Gate() {
  const { loading, user, roles } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (roles.length && !canAccess(roles, pathname)) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">This page isn't available for your role</p>
          <p className="mt-1 text-sm text-muted-foreground">You're signed in as {roles.map((r) => ROLE_LABELS[r]).join(", ")}.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm font-medium text-primary">Go to dashboard →</Link>
        </div>
      </div>
    );
  }
  return <AppShell />;
}
