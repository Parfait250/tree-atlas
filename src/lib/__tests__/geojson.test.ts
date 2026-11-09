import { describe, expect, it } from "vitest";
import { SEED_TREES } from "../data";
import { filterTrees, toGeoJSON } from "../geojson";

describe("geojson export", () => {
  it("uses [longitude, latitude] order", () => {
    const t = SEED_TREES[0];
    const f = toGeoJSON([t]).features[0];
    expect(f.geometry.coordinates).toEqual([t.lng, t.lat]);
  });
  it("filters by district", () => {
    const out = filterTrees(SEED_TREES, { district: "Huye" });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((t) => t.district === "Huye")).toBe(true);
  });
});
