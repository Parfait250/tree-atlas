import type { Tree } from "./data";

export interface GeoFilter {
  district?: string;
  health?: string;
  category?: string;
}

export function filterTrees(trees: Tree[], f: GeoFilter) {
  return trees.filter(
    (t) =>
      (!f.district || t.district === f.district) &&
      (!f.health || t.health === f.health) &&
      (!f.category || t.category === f.category),
  );
}

/** RFC 7946 FeatureCollection, WGS84, coordinates [lng, lat]. */
export function toGeoJSON(trees: Tree[]) {
  return {
    type: "FeatureCollection" as const,
    name: "tree360_rwanda_trees",
    features: trees.map((t) => ({
      type: "Feature" as const,
      id: t.id,
      geometry: { type: "Point" as const, coordinates: [t.lng, t.lat] },
      properties: {
        tree_id: t.id,
        species: t.species,
        category: t.category,
        location: t.location,
        district: t.district,
        health: t.health,
        height_m: t.height,
        diameter_cm: t.diameter,
        planted_on: t.plantedOn,
        last_inspection: t.lastInspection,
      },
    })),
  };
}

export function summarize(trees: Tree[]) {
  const by = (k: keyof Tree) =>
    trees.reduce<Record<string, number>>((m, t) => ((m[String(t[k])] = (m[String(t[k])] || 0) + 1), m), {});
  return { total: trees.length, by_district: by("district"), by_health: by("health"), by_category: by("category") };
}

export function downloadText(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
