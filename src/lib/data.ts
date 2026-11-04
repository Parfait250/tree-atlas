// Illustrative demonstration data only — not verified forestry records.
export type Health = "Healthy" | "Needs attention" | "Critical" | "Dead";
export type Category = "Urban" | "Fruit";

export interface Tree {
  id: string;
  species: string;
  category: Category;
  location: string;
  district: string;
  lat: number;
  lng: number;
  plantedOn: string;
  height: number; // m
  diameter: number; // cm
  health: Health;
  lastInspection: string;
  notes?: string;
  photo?: string;
  isNew?: boolean;
}

export interface Inspection {
  id: string;
  treeId: string;
  date: string;
  health: Health;
  height: number;
  diameter: number;
  pests: string;
  maintenance: string;
  observations: string;
  inspector: string;
  photo?: string;
}

export const URBAN_SPECIES = ["Eucalyptus", "Grevillea", "Jacaranda", "Markhamia", "Cedrela", "Podocarpus", "Ficus"];
export const FRUIT_SPECIES = ["Avocado", "Mango", "Orange", "Lemon", "Passion fruit"];
export const ALL_SPECIES = [...FRUIT_SPECIES, ...URBAN_SPECIES];

export const DISTRICTS: { name: string; lat: number; lng: number; spread: number }[] = [
  { name: "Gasabo", lat: -1.93, lng: 30.1, spread: 0.035 },
  { name: "Nyarugenge", lat: -1.955, lng: 30.058, spread: 0.02 },
  { name: "Kicukiro", lat: -1.99, lng: 30.1, spread: 0.025 },
  { name: "Rwamagana", lat: -1.948, lng: 30.435, spread: 0.03 },
  { name: "Musanze", lat: -1.5, lng: 29.635, spread: 0.03 },
  { name: "Huye", lat: -2.597, lng: 29.739, spread: 0.03 },
  { name: "Rubavu", lat: -1.68, lng: 29.26, spread: 0.025 },
  { name: "Nyagatare", lat: -1.3, lng: 30.33, spread: 0.03 },
];

const PLACES: Record<string, string[]> = {
  Gasabo: ["Kimihurura Park", "Kacyiru School", "Remera Roadside", "Kibagabaga Estate"],
  Nyarugenge: ["Nyamirambo Green Space", "City Centre Boulevard", "Kiyovu Residential"],
  Kicukiro: ["Gikondo Public Park", "Niboye School", "Kagarama Cooperative"],
  Rwamagana: ["Rwamagana Fruit Nursery", "Muhazi Farm Plot"],
  Musanze: ["Musanze Town Square", "Kinigi Cooperative"],
  Huye: ["Huye Campus Grounds", "Tumba Farm"],
  Rubavu: ["Gisenyi Lakeshore", "Rubavu Market Row"],
  Nyagatare: ["Nyagatare Orchard", "Matimba Farm"],
};

// deterministic pseudo-random
let seed = 42;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
const pad = (n: number) => String(n).padStart(4, "0");
const dateBetween = (y1: number, y2: number) => {
  const d = new Date(y1, 0, 1).getTime() + rnd() * (new Date(y2, 0, 1).getTime() - new Date(y1, 0, 1).getTime());
  return new Date(d).toISOString().slice(0, 10);
};

function buildTrees(): Tree[] {
  const fixed: Partial<Tree>[] = [
    { species: "Avocado", category: "Fruit", district: "Gasabo", health: "Healthy" },
    { species: "Mango", category: "Fruit", district: "Rwamagana", health: "Healthy" },
    { species: "Eucalyptus", category: "Urban", district: "Nyarugenge", health: "Needs attention" },
    { species: "Grevillea", category: "Urban", district: "Musanze", health: "Healthy" },
    { species: "Orange", category: "Fruit", district: "Nyagatare", health: "Dead" },
  ];
  const trees: Tree[] = [];
  for (let i = 0; i < 64; i++) {
    const f = fixed[i] ?? {};
    const kigali = i < 40;
    const d = f.district
      ? DISTRICTS.find((x) => x.name === f.district)!
      : kigali
        ? pick(DISTRICTS.slice(0, 3))
        : pick(DISTRICTS.slice(3));
    const category: Category = f.category ?? (rnd() < 0.55 ? "Urban" : "Fruit");
    const r = rnd();
    const health: Health = f.health ?? (r < 0.78 ? "Healthy" : r < 0.88 ? "Needs attention" : r < 0.93 ? "Critical" : "Dead");
    const planted = dateBetween(2019, 2025);
    trees.push({
      id: `TR-${pad(i + 1)}`,
      species: f.species ?? pick(category === "Urban" ? URBAN_SPECIES : FRUIT_SPECIES),
      category,
      district: d.name,
      location: pick(PLACES[d.name]),
      lat: +(d.lat + (rnd() - 0.5) * d.spread * 2).toFixed(5),
      lng: +(d.lng + (rnd() - 0.5) * d.spread * 2).toFixed(5),
      plantedOn: planted,
      height: +(1 + rnd() * 9).toFixed(1),
      diameter: Math.round(4 + rnd() * 40),
      health,
      lastInspection: dateBetween(2026, 2026.8 as unknown as number),
    });
  }
  return trees;
}

function buildInspections(trees: Tree[]): Inspection[] {
  const out: Inspection[] = [];
  const inspectors = ["J. Mugisha", "A. Uwase", "E. Niyonzima", "C. Ingabire"];
  const order: Health[] = ["Healthy", "Needs attention", "Critical", "Dead"];
  trees.forEach((t) => {
    const n = 2 + Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) {
      const months = (n - 1 - k) * 4;
      const dt = new Date(t.lastInspection);
      dt.setMonth(dt.getMonth() - months);
      const isLast = k === n - 1;
      const idx = order.indexOf(t.health);
      const h: Health = isLast ? t.health : order[Math.max(0, idx - (rnd() < 0.6 ? 1 : 0))];
      const g = 1 - months * 0.02;
      out.push({
        id: `IN-${t.id}-${k}`,
        treeId: t.id,
        date: dt.toISOString().slice(0, 10),
        health: h,
        height: +(t.height * g).toFixed(1),
        diameter: Math.round(t.diameter * g),
        pests: h === "Healthy" ? "None observed" : pick(["Leaf spots", "Aphids on young shoots", "Bark damage", "Wilting leaves"]),
        maintenance: h === "Healthy" ? "None" : pick(["Watering required", "Pruning required", "Mulching needed", "Staking needed"]),
        observations: h === "Healthy" ? "Good canopy and steady growth." : "Follow-up visit recommended.",
        inspector: pick(inspectors),
      });
    }
  });
  return out;
}

export const SEED_TREES = buildTrees();
export const SEED_INSPECTIONS = buildInspections(SEED_TREES);

// Demonstration headline figures (illustrative).
export const DEMO_TARGET = { total: 2450, healthy: 2080, attention: 245, dead: 125, locations: 32, inspections: 1840 };

export const HEALTH_COLOR: Record<Health, string> = {
  Healthy: "var(--healthy)",
  "Needs attention": "var(--warning)",
  Critical: "var(--destructive)",
  Dead: "oklch(0.35 0.02 160)",
};

export const FRUIT_FARMS = [
  { farm: "Rwamagana Fruit Nursery", district: "Rwamagana", species: "Mango", trees: 420, age: 4, health: "Healthy", production: 18.5, harvest: "Nov – Feb" },
  { farm: "Kagarama Cooperative", district: "Kicukiro", species: "Avocado", trees: 310, age: 6, health: "Healthy", production: 22.1, harvest: "Mar – Jul" },
  { farm: "Nyagatare Orchard", district: "Nyagatare", species: "Orange", trees: 260, age: 5, health: "Needs attention", production: 11.4, harvest: "May – Aug" },
  { farm: "Kinigi Cooperative", district: "Musanze", species: "Passion fruit", trees: 540, age: 2, health: "Healthy", production: 9.8, harvest: "Year-round" },
  { farm: "Tumba Farm", district: "Huye", species: "Lemon", trees: 180, age: 3, health: "Healthy", production: 5.2, harvest: "Jun – Sep" },
  { farm: "Kacyiru School", district: "Gasabo", species: "Avocado", trees: 65, age: 7, health: "Healthy", production: 4.6, harvest: "Mar – Jul" },
  { farm: "Matimba Farm", district: "Nyagatare", species: "Mango", trees: 230, age: 8, health: "Needs attention", production: 12.9, harvest: "Nov – Feb" },
  { farm: "Gisenyi Lakeshore", district: "Rubavu", species: "Passion fruit", trees: 150, age: 2, health: "Healthy", production: 3.1, harvest: "Year-round" },
];

export const PRODUCTION_TREND = [
  { year: "2021", Avocado: 14, Mango: 18, Orange: 7, Lemon: 2, "Passion fruit": 5 },
  { year: "2022", Avocado: 18, Mango: 22, Orange: 9, Lemon: 3, "Passion fruit": 8 },
  { year: "2023", Avocado: 21, Mango: 25, Orange: 10, Lemon: 4, "Passion fruit": 10 },
  { year: "2024", Avocado: 24, Mango: 28, Orange: 11, Lemon: 4.6, "Passion fruit": 11 },
  { year: "2025", Avocado: 26.7, Mango: 31.4, Orange: 11.4, Lemon: 5.2, "Passion fruit": 12.9 },
];

export const MONTHLY_INSPECTIONS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"].map((m, i) => ({
  month: m, inspections: [120, 140, 165, 150, 190, 210, 185, 230, 220, 230][i],
}));

export const SURVIVAL_TREND = ["2021","2022","2023","2024","2025","2026"].map((y, i) => ({
  year: y, rate: [81, 84, 86, 88, 90, 91.2][i],
}));

export const ACTIVITIES = [
  { text: "New avocado tree registered", place: "Kimihurura, Kigali", date: "2026-11-03" },
  { text: "Tree inspection completed in an urban public park", place: "Gikondo Public Park, Kicukiro", date: "2026-11-02" },
  { text: "Five trees marked for maintenance", place: "Remera Roadside, Gasabo", date: "2026-10-31" },
  { text: "Planting location added", place: "Muhazi Farm Plot, Rwamagana", date: "2026-10-29" },
  { text: "New fruit-tree nursery record submitted", place: "Rwamagana Fruit Nursery", date: "2026-10-27" },
];

export const DISCLAIMER =
  "Tree360 Rwanda is a proposed innovation prototype. All displayed tree records, locations, statistics and activities are illustrative demonstration data and do not represent verified national forestry records.";
