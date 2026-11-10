import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Tree } from "@/lib/data";

export const markerColor = (t: Tree) =>
  t.isNew ? "var(--info)" : t.health === "Healthy" ? "var(--healthy)" : t.health === "Dead" || t.health === "Critical" ? "var(--destructive)" : "var(--warning)";

const INITIAL: [number, number] = [-1.955, 30.08];

export default function TreeMap({
  trees,
  focusId,
  heat = false,
  height = "100%",
  onReady,
}: {
  trees: Tree[];
  focusId?: string | null;
  heat?: boolean;
  height?: string;
  onReady?: (reset: () => void) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef<Record<string, L.CircleMarker>>({});

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: true }).setView(INITIAL, 12);
    const street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(m);
    const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      attribution: "© OpenStreetMap contributors, SRTM | © OpenTopoMap",
    });
    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics" },
    );
    const labels = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19 },
    );
    const hybrid = L.layerGroup([
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Tiles © Esri" },
      ),
      labels,
    ]);
    L.control
      .layers({ Street: street, Satellite: satellite, "Satellite + labels": hybrid, Terrain: topo })
      .addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    onReady?.(() => m.setView(INITIAL, 12));
    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    markers.current = {};
    const css = getComputedStyle(document.documentElement);
    const resolve = (v: string) => (v.startsWith("var(") ? css.getPropertyValue(v.slice(4, -1)).trim() : v);
    trees.forEach((t) => {
      const color = resolve(markerColor(t));
      const mk = L.circleMarker([t.lat, t.lng], {
        radius: heat ? 18 : 7,
        color: heat ? color : "#ffffff",
        weight: heat ? 0 : 2,
        fillColor: color,
        fillOpacity: heat ? 0.25 : 0.95,
      }).bindPopup(
        `<div style="min-width:190px;font-size:12px;line-height:1.55">
          <div style="font-weight:600;font-size:14px">${t.id} · ${t.species}</div>
          <div style="color:#64748b;margin-bottom:6px">${t.location}, ${t.district}</div>
          <div><b>Type:</b> ${t.category} tree</div>
          <div><b>GPS:</b> ${t.lat.toFixed(5)}, ${t.lng.toFixed(5)}</div>
          <div><b>Health:</b> <span style="color:${color};font-weight:600">${t.isNew ? "Newly registered · " : ""}${t.health}</span></div>
          <div><b>Planted:</b> ${t.plantedOn}</div>
          <div><b>Last inspection:</b> ${t.lastInspection}</div>
          <div style="margin-top:6px;color:#94a3b8;font-size:10px">Illustrative demo record</div>
        </div>`,
      );
      mk.addTo(g);
      markers.current[t.id] = mk;
    });
  }, [trees, heat]);

  useEffect(() => {
    if (!focusId || !map.current) return;
    const mk = markers.current[focusId];
    if (mk) {
      map.current.setView(mk.getLatLng(), 16);
      mk.openPopup();
    }
  }, [focusId, trees]);

  return <div ref={el} style={{ height, width: "100%" }} className="rounded-xl" />;
}
