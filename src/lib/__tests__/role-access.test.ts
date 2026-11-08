import { describe, it, expect } from "vitest";
import { canAccess } from "../auth";

describe("role access", () => {
  it("only admins can open Future Integration", () => {
    expect(canAccess(["admin"], "/integration")).toBe(true);
    expect(canAccess(["field_officer", "ministry_official", "researcher"], "/integration")).toBe(false);
  });
  it("field officers cannot open reports", () => {
    expect(canAccess(["field_officer"], "/reports")).toBe(false);
  });
  it("researchers cannot open inspections", () => {
    expect(canAccess(["researcher"], "/inspections")).toBe(false);
  });
});

import { landingFor as lf } from "@/lib/auth";
describe("admin center", () => {
  it("admins land on and can open /admin; others cannot", () => {
    expect(lf(["admin"])).toBe("/admin");
    expect(canAccess(["admin"], "/admin")).toBe(true);
    expect(canAccess(["ministry_official"], "/admin")).toBe(false);
    expect(canAccess(["researcher", "field_officer"], "/admin")).toBe(false);
  });
});
