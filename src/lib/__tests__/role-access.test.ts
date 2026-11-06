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
