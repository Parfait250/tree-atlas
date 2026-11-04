import { useState, type FormEvent } from "react";
import { Crosshair, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ALL_SPECIES, DISTRICTS, FRUIT_SPECIES, type Category, type Health } from "@/lib/data";
import { useStore } from "@/lib/store";
import { fieldCls } from "./ui-kit";

export function readPhoto(file: File | undefined): Promise<string | undefined> {
  return new Promise((res) => {
    if (!file) return res(undefined);
    // Downscale to keep localStorage small.
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const s = Math.min(1, 480 / img.width);
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => res(undefined);
    img.src = URL.createObjectURL(file);
  });
}

export function Field({ label, error, children, req }: { label: string; error?: string; children: React.ReactNode; req?: boolean }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
      <span>{label}{req && <span className="text-destructive"> *</span>}</span>
      {children}
      {error && <span className="font-normal text-destructive">{error}</span>}
    </label>
  );
}

export function RegisterTreeButton({ onDone }: { onDone?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="size-4" /> Register New Tree</Button>
      {open && <RegisterTreeDialog onClose={() => setOpen(false)} onDone={onDone} />}
    </>
  );
}

function RegisterTreeDialog({ onClose, onDone }: { onClose: () => void; onDone?: (id: string) => void }) {
  const { addTree, nextId } = useStore();
  const [id] = useState(nextId);
  const [f, setF] = useState({
    species: "", category: "Urban" as Category, district: "", location: "", lat: "", lng: "",
    plantedOn: new Date().toISOString().slice(0, 10), height: "", diameter: "", health: "Healthy" as Health, notes: "",
  });
  const [photo, setPhoto] = useState<File>();
  const [err, setErr] = useState<Record<string, string>>({});
  const [locating, setLocating] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const gps = () => {
    if (!navigator.geolocation) return toast.error("Location is not available in this browser.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setF((x) => ({ ...x, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast.error("Location permission denied — enter coordinates manually.");
      },
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.species) er.species = "Select a species";
    if (!f.district) er.district = "Select a district";
    if (!f.location.trim()) er.location = "Enter a site name";
    const lat = parseFloat(f.lat), lng = parseFloat(f.lng);
    if (isNaN(lat) || lat < -3 || lat > -1) er.lat = "Latitude within Rwanda (-3 to -1)";
    if (isNaN(lng) || lng < 28.8 || lng > 31) er.lng = "Longitude within Rwanda (28.8 to 31)";
    if (!f.plantedOn) er.plantedOn = "Required";
    setErr(er);
    if (Object.keys(er).length) return;
    addTree({
      id, species: f.species, category: f.category, district: f.district, location: f.location.trim(), lat, lng,
      plantedOn: f.plantedOn, height: parseFloat(f.height) || 0.5, diameter: parseFloat(f.diameter) || 1,
      health: f.health, lastInspection: new Date().toISOString().slice(0, 10), notes: f.notes, photo: await readPhoto(photo), isNew: true,
    });
    toast.success(`${id} registered and added to the map`);
    onDone?.(id);
    onClose();
  };

  const species = f.category === "Fruit" ? FRUIT_SPECIES : ALL_SPECIES.filter((s) => !FRUIT_SPECIES.includes(s));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-3" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-card">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Register a new tree</h2>
            <p className="text-xs text-muted-foreground">Tree ID <b className="text-primary">{id}</b> · generated automatically</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}><X className="size-5" /></button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tree category" req>
            <select className={fieldCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Category, species: "" })}>
              <option>Urban</option><option>Fruit</option>
            </select>
          </Field>
          <Field label="Tree species" req error={err.species}>
            <select className={fieldCls} value={f.species} onChange={set("species")}>
              <option value="">Select…</option>{species.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="District" req error={err.district}>
            <select className={fieldCls} value={f.district} onChange={set("district")}>
              <option value="">Select…</option>{DISTRICTS.map((d) => <option key={d.name}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Location / site" req error={err.location}>
            <input className={fieldCls} value={f.location} onChange={set("location")} placeholder="e.g. Kimihurura Park" />
          </Field>
          <Field label="GPS latitude" req error={err.lat}>
            <input className={fieldCls} value={f.lat} onChange={set("lat")} placeholder="-1.9441" inputMode="decimal" />
          </Field>
          <Field label="GPS longitude" req error={err.lng}>
            <input className={fieldCls} value={f.lng} onChange={set("lng")} placeholder="30.0619" inputMode="decimal" />
          </Field>
          <div className="sm:col-span-2 -mt-2">
            <Button type="button" variant="outline" size="sm" onClick={gps} disabled={locating}>
              <Crosshair className="size-4" /> {locating ? "Locating…" : "Use my current location"}
            </Button>
          </div>
          <Field label="Planting date" req error={err.plantedOn}>
            <input type="date" className={fieldCls} value={f.plantedOn} onChange={set("plantedOn")} />
          </Field>
          <Field label="Initial health condition">
            <select className={fieldCls} value={f.health} onChange={set("health")}>
              <option>Healthy</option><option>Needs attention</option><option>Critical</option>
            </select>
          </Field>
          <Field label="Approx. height (m)">
            <input className={fieldCls} value={f.height} onChange={set("height")} inputMode="decimal" placeholder="1.2" />
          </Field>
          <Field label="Trunk diameter (cm)">
            <input className={fieldCls} value={f.diameter} onChange={set("diameter")} inputMode="decimal" placeholder="3" />
          </Field>
          <Field label="Photograph">
            <input type="file" accept="image/*" className="text-xs" onChange={(e) => setPhoto(e.target.files?.[0])} />
          </Field>
          <Field label="Additional notes">
            <textarea className={fieldCls + " h-20 py-2"} value={f.notes} onChange={set("notes")} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Register tree</Button>
        </div>
      </form>
    </div>
  );
}
