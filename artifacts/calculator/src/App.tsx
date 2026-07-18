import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type TabId = "footings" | "columns" | "beams" | "slabs";
type SlabSubType = "solid" | "hollow" | "flat" | "waffle";

interface Floor {
  id: string;
  name: string;
}

interface ElementType {
  id: string;
  label: string;
  dim1: string;
  dim2: string;
  dim3: string;
  quantity: string;
  floorId: string;
}

interface ProjectInfo {
  projectName: string;
  engineerName: string;
  clientName: string;
  concretePricePerM3: string;
  steelPricePerTon: string;
  footingSteelRatio: string;
  columnSteelRatio: string;
  beamSteelRatio: string;
  solidSlabSteelRatio: string;
  hollowSlabSteelRatio: string;
  flatSlabSteelRatio: string;
  waffleSlabSteelRatio: string;
  hollowConcreteRatio: string;
  waffleConcreteRatio: string;
}

const LS_KEY = "structural-calc-projects";

interface MixDesign {
  cement: string;
  sand: string;
  gravel: string;
  compactionFactor: string;
  bagWeightKg: string;
}

interface MixResult {
  dryVolume: number;
  cementVolume: number;
  sandVolume: number;
  gravelVolume: number;
  cementBags: number;
}

const initialMix: MixDesign = {
  cement: "1",
  sand: "2",
  gravel: "4",
  compactionFactor: "1.54",
  bagWeightKg: "50",
};

const MIX_PRESETS: { label: string; grade: string; c: string; s: string; g: string }[] = [
  { label: "1:2:4",   grade: "B200 / C16", c: "1", s: "2",   g: "4" },
  { label: "1:1.5:3", grade: "B250 / C20", c: "1", s: "1.5", g: "3" },
  { label: "1:1:2",   grade: "B300 / C25", c: "1", s: "1",   g: "2" },
];

function computeMix(totalVolume: number, m: MixDesign): MixResult {
  const c  = parseFloat(m.cement)            || 1;
  const s  = parseFloat(m.sand)              || 2;
  const g  = parseFloat(m.gravel)            || 4;
  const cf = parseFloat(m.compactionFactor)  || 1.54;
  const bw = parseFloat(m.bagWeightKg)       || 50;
  const total = c + s + g;
  const dryVolume    = totalVolume * cf;
  const cementVolume = (c / total) * dryVolume;
  const sandVolume   = (s / total) * dryVolume;
  const gravelVolume = (g / total) * dryVolume;
  const cementBags   = Math.ceil(cementVolume / (bw / 1440));
  return { dryVolume, cementVolume, sandVolume, gravelVolume, cementBags };
}

interface SavedProject {
  id: string;
  name: string;
  savedAt: number;
  project: ProjectInfo;
  floors: Floor[];
  footings: ElementType[];
  columns: ElementType[];
  beams: ElementType[];
  solidSlabs: ElementType[];
  hollowSlabs: ElementType[];
  flatSlabs: ElementType[];
  waffleSlabs: ElementType[];
  mix?: MixDesign;
  includeSteel?: boolean;
}

function lsLoad(): SavedProject[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as SavedProject[]; } catch { return []; }
}

function lsSave(list: SavedProject[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

interface ElementResult {
  id: string;
  label: string;
  dim1: number;
  dim2: number;
  dim3: number;
  quantity: number;
  volumeEach: number;
  totalVolume: number;
  steelKg: number;
}

interface SectionSummary {
  elements: ElementResult[];
  totalVolume: number;
  totalSteelKg: number;
  totalSteelTons: number;
  concreteCost: number;
  steelCost: number;
  total: number;
}

interface FloorBreakdown {
  floor: Floor;
  footings: SectionSummary;
  columns: SectionSummary;
  beams: SectionSummary;
  solidSlabs: SectionSummary;
  hollowSlabs: SectionSummary;
  flatSlabs: SectionSummary;
  waffleSlabs: SectionSummary;
  totalVolume: number;
  totalSteelKg: number;
  totalSteelTons: number;
  totalCost: number;
}

interface FullSummary {
  footings: SectionSummary;
  columns: SectionSummary;
  beams: SectionSummary;
  solidSlabs: SectionSummary;
  hollowSlabs: SectionSummary;
  flatSlabs: SectionSummary;
  waffleSlabs: SectionSummary;
  byFloor: FloorBreakdown[];
  totalConcreteVolume: number;
  totalSteelKg: number;
  totalSteelTons: number;
  totalConcreteCost: number;
  totalSteelCost: number;
  grandTotal: number;
}

interface BOQItem {
  no: number;
  typeLabel: string;
  typeCode: string;
  floorName: string;
  label: string;
  dim1: number; dim2: number; dim3: number;
  qty: number;
  volEach: number;
  volTotal: number;
  steelKgTotal: number;
  costTotal: number;
}

const DEFAULT_FLOOR_ID = "floor-ground";

const newElement = (floorId: string = DEFAULT_FLOOR_ID): ElementType => ({
  id: crypto.randomUUID(),
  label: "",
  dim1: "",
  dim2: "",
  dim3: "",
  quantity: "1",
  floorId,
});

const initialProject: ProjectInfo = {
  projectName: "",
  engineerName: "",
  clientName: "",
  concretePricePerM3: "",
  steelPricePerTon: "",
  footingSteelRatio: "80",
  columnSteelRatio: "120",
  beamSteelRatio: "150",
  solidSlabSteelRatio: "90",
  hollowSlabSteelRatio: "50",
  flatSlabSteelRatio: "110",
  waffleSlabSteelRatio: "85",
  hollowConcreteRatio: "0.55",
  waffleConcreteRatio: "0.65",
};

const initialFloors: Floor[] = [
  { id: DEFAULT_FLOOR_ID, name: "الدور الأرضي" },
];

const SLAB_SUBTYPES: {
  id: SlabSubType;
  label: string;
  shortLabel: string;
  color: string;
  activeBg: string;
  steelRatioKey: keyof ProjectInfo;
  concreteRatioKey?: keyof ProjectInfo;
  defaultLabel: string;
  note?: string;
}[] = [
  { id: "solid",  label: "بلاطة مصمتة",         shortLabel: "مصمتة", color: "purple", activeBg: "bg-purple-600", steelRatioKey: "solidSlabSteelRatio",  defaultLabel: "SS", note: "حجم الخرسانة = الطول × العرض × السمك" },
  { id: "hollow", label: "بلاطة مجوفة (هولوكور)", shortLabel: "مجوفة", color: "rose",   activeBg: "bg-rose-600",   steelRatioKey: "hollowSlabSteelRatio", concreteRatioKey: "hollowConcreteRatio", defaultLabel: "HS", note: "حجم الخرسانة الفعلي = الطول × العرض × السمك × نسبة الخرسانة" },
  { id: "flat",   label: "بلاطة مسطحة",          shortLabel: "مسطحة", color: "teal",   activeBg: "bg-teal-600",   steelRatioKey: "flatSlabSteelRatio",   defaultLabel: "FS", note: "حجم الخرسانة = الطول × العرض × السمك" },
  { id: "waffle", label: "بلاطة واف",             shortLabel: "واف",   color: "amber",  activeBg: "bg-amber-600",  steelRatioKey: "waffleSlabSteelRatio", concreteRatioKey: "waffleConcreteRatio", defaultLabel: "WS", note: "حجم الخرسانة الفعلي = الطول × العرض × السمك × نسبة الخرسانة" },
];

function isElementValid(e: ElementType) {
  return parseFloat(e.dim1) > 0 && parseFloat(e.dim2) > 0 && parseFloat(e.dim3) > 0 && parseInt(e.quantity) > 0;
}

function isPricesValid(p: ProjectInfo, requireSteel = true) {
  const concreteOk = parseFloat(p.concretePricePerM3) > 0;
  return requireSteel ? concreteOk && parseFloat(p.steelPricePerTon) > 0 : concreteOk;
}

function computeSection(
  elements: ElementType[],
  ratio: number,
  concretePrice: number,
  steelPricePerTon: number,
  concreteEfficiency = 1.0,
  floorId?: string
): SectionSummary {
  const filtered = floorId !== undefined ? elements.filter((e) => e.floorId === floorId) : elements;
  const results: ElementResult[] = filtered.filter(isElementValid).map((e) => {
    const d1 = parseFloat(e.dim1), d2 = parseFloat(e.dim2), d3 = parseFloat(e.dim3), q = parseInt(e.quantity);
    const volumeEach = d1 * d2 * d3 * concreteEfficiency;
    const totalVolume = volumeEach * q;
    return { id: e.id, label: e.label || "عنصر", dim1: d1, dim2: d2, dim3: d3, quantity: q, volumeEach, totalVolume, steelKg: totalVolume * ratio };
  });
  const totalVolume = results.reduce((s, r) => s + r.totalVolume, 0);
  const totalSteelKg = results.reduce((s, r) => s + r.steelKg, 0);
  const totalSteelTons = totalSteelKg / 1000;
  const concreteCost = totalVolume * concretePrice;
  const steelCost = totalSteelTons * steelPricePerTon;
  return { elements: results, totalVolume, totalSteelKg, totalSteelTons, concreteCost, steelCost, total: concreteCost + steelCost };
}

function computeFull(
  footings: ElementType[], columns: ElementType[], beams: ElementType[],
  solidSlabs: ElementType[], hollowSlabs: ElementType[], flatSlabs: ElementType[], waffleSlabs: ElementType[],
  floors: Floor[], p: ProjectInfo
): FullSummary {
  const cp = parseFloat(p.concretePricePerM3), sp = parseFloat(p.steelPricePerTon);
  const fr = parseFloat(p.footingSteelRatio || "80"), cr = parseFloat(p.columnSteelRatio || "120");
  const br = parseFloat(p.beamSteelRatio || "150");
  const ssr = parseFloat(p.solidSlabSteelRatio || "90"),  hsr = parseFloat(p.hollowSlabSteelRatio || "50");
  const fsr = parseFloat(p.flatSlabSteelRatio  || "110"), wsr = parseFloat(p.waffleSlabSteelRatio || "85");
  const hce = parseFloat(p.hollowConcreteRatio || "0.55"), wce = parseFloat(p.waffleConcreteRatio || "0.65");

  const f  = computeSection(footings,    fr,  cp, sp);
  const c  = computeSection(columns,     cr,  cp, sp);
  const b  = computeSection(beams,       br,  cp, sp);
  const ss = computeSection(solidSlabs,  ssr, cp, sp);
  const hs = computeSection(hollowSlabs, hsr, cp, sp, hce);
  const fs = computeSection(flatSlabs,   fsr, cp, sp);
  const ws = computeSection(waffleSlabs, wsr, cp, sp, wce);
  const all = [f, c, b, ss, hs, fs, ws];

  const byFloor: FloorBreakdown[] = floors.map((floor) => {
    const ff  = computeSection(footings,    fr,  cp, sp, 1,   floor.id);
    const fc  = computeSection(columns,     cr,  cp, sp, 1,   floor.id);
    const fb  = computeSection(beams,       br,  cp, sp, 1,   floor.id);
    const fss = computeSection(solidSlabs,  ssr, cp, sp, 1,   floor.id);
    const fhs = computeSection(hollowSlabs, hsr, cp, sp, hce, floor.id);
    const ffs = computeSection(flatSlabs,   fsr, cp, sp, 1,   floor.id);
    const fws = computeSection(waffleSlabs, wsr, cp, sp, wce, floor.id);
    const fa = [ff, fc, fb, fss, fhs, ffs, fws];
    return {
      floor,
      footings: ff, columns: fc, beams: fb,
      solidSlabs: fss, hollowSlabs: fhs, flatSlabs: ffs, waffleSlabs: fws,
      totalVolume:    fa.reduce((s, x) => s + x.totalVolume, 0),
      totalSteelKg:   fa.reduce((s, x) => s + x.totalSteelKg, 0),
      totalSteelTons: fa.reduce((s, x) => s + x.totalSteelTons, 0),
      totalCost:      fa.reduce((s, x) => s + x.total, 0),
    };
  });

  return {
    footings: f, columns: c, beams: b,
    solidSlabs: ss, hollowSlabs: hs, flatSlabs: fs, waffleSlabs: ws,
    byFloor,
    totalConcreteVolume: all.reduce((s, x) => s + x.totalVolume, 0),
    totalSteelKg:        all.reduce((s, x) => s + x.totalSteelKg, 0),
    totalSteelTons:      all.reduce((s, x) => s + x.totalSteelTons, 0),
    totalConcreteCost:   all.reduce((s, x) => s + x.concreteCost, 0),
    totalSteelCost:      all.reduce((s, x) => s + x.steelCost, 0),
    grandTotal:          all.reduce((s, x) => s + x.total, 0),
  };
}

const BOQ_META: { key: keyof FullSummary; typeLabel: string; typeCode: string }[] = [
  { key: "footings",    typeLabel: "قواعد",         typeCode: "F"  },
  { key: "columns",     typeLabel: "أعمدة",          typeCode: "C"  },
  { key: "beams",       typeLabel: "كمرات",          typeCode: "B"  },
  { key: "solidSlabs",  typeLabel: "بلاطة مصمتة",    typeCode: "SS" },
  { key: "hollowSlabs", typeLabel: "بلاطة مجوفة",    typeCode: "HS" },
  { key: "flatSlabs",   typeLabel: "بلاطة مسطحة",    typeCode: "FS" },
  { key: "waffleSlabs", typeLabel: "بلاطة واف",      typeCode: "WS" },
];

function computeBOQ(
  summary: FullSummary,
  floors: Floor[],
  rawArrays: ElementType[][],
  cp: number,
  sp: number,
): BOQItem[] {
  const floorMap = new Map(floors.map((f) => [f.id, f.name]));
  const items: BOQItem[] = [];
  let no = 1;
  BOQ_META.forEach(({ key, typeLabel, typeCode }, si) => {
    const section = summary[key] as SectionSummary;
    const idToFloor = new Map(rawArrays[si].map((e) => [e.id, e.floorId]));
    section.elements.forEach((er) => {
      const floorId  = idToFloor.get(er.id) ?? "";
      const floorName = floorMap.get(floorId) ?? "-";
      const concreteCost = er.totalVolume * cp;
      const steelCost    = (er.steelKg / 1000) * sp;
      items.push({
        no: no++, typeLabel, typeCode, floorName,
        label: er.label || typeCode + no,
        dim1: er.dim1, dim2: er.dim2, dim3: er.dim3,
        qty: er.quantity,
        volEach: er.volumeEach,
        volTotal: er.totalVolume,
        steelKgTotal: er.steelKg,
        costTotal: concreteCost + steelCost,
      });
    });
  });
  return items;
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("ar-EG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const MAIN_TABS: { id: TabId; label: string; icon: string; dim1Label: string; dim2Label: string; dim3Label: string; defaultLabel: string }[] = [
  { id: "footings", label: "القواعد",  icon: "🟦", dim1Label: "الطول (م)", dim2Label: "العرض (م)", dim3Label: "السمك (م)",    defaultLabel: "F" },
  { id: "columns",  label: "الأعمدة", icon: "🟧", dim1Label: "العرض (م)", dim2Label: "العمق (م)", dim3Label: "الارتفاع (م)", defaultLabel: "C" },
  { id: "beams",    label: "الكمرات", icon: "🟩", dim1Label: "العرض (م)", dim2Label: "العمق (م)", dim3Label: "الطول (م)",    defaultLabel: "B" },
  { id: "slabs",    label: "البلاطات",icon: "🟪", dim1Label: "الطول (م)", dim2Label: "العرض (م)", dim3Label: "السمك (م)",    defaultLabel: "S" },
];

function ElementCard({
  element, idx, dim1Label, dim2Label, dim3Label, defaultLabel,
  tabCount, floors, accentColor, onChange, onRemove,
}: {
  element: ElementType; idx: number;
  dim1Label: string; dim2Label: string; dim3Label: string; defaultLabel: string;
  tabCount: number; floors: Floor[]; accentColor?: string;
  onChange: (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onRemove: (id: string) => void;
}) {
  const accent = accentColor || "blue";
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span className={`w-6 h-6 bg-${accent}-600 text-white rounded-full flex items-center justify-center text-xs font-bold`}>{idx + 1}</span>
          عنصر {idx + 1}
        </span>
        {tabCount > 1 && (
          <button type="button" onClick={() => onRemove(element.id)}
            className="text-red-400 hover:text-red-600 transition p-1 rounded-lg hover:bg-red-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">المسمى / الرمز <span className="text-slate-400">(اختياري)</span></label>
            <input type="text" name="label" value={element.label} onChange={(e) => onChange(element.id, e)}
              placeholder={`مثال: ${defaultLabel}${idx + 1}`}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">الطابق</label>
            <select name="floorId" value={element.floorId} onChange={(e) => onChange(element.id, e)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white">
              {floors.map((fl) => (
                <option key={fl.id} value={fl.id}>{fl.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: "dim1", label: dim1Label },
            { name: "dim2", label: dim2Label },
            { name: "dim3", label: dim3Label },
            { name: "quantity", label: "العدد", min: "1", step: "1" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
              <input type="number" name={field.name}
                value={element[field.name as keyof ElementType]}
                onChange={(e) => onChange(element.id, e)}
                placeholder={field.name === "quantity" ? "1" : "0.00"}
                min={field.min ?? "0.01"} step={field.step ?? "0.01"}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionTable({ section, title, colorClass }: {
  section: SectionSummary; title: string; colorClass?: string;
}) {
  if (section.elements.length === 0) return null;
  const hdr = colorClass || "bg-blue-50 border-blue-200 text-blue-800";
  return (
    <div>
      <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">{title}</h4>
      <div className="rounded-lg border border-slate-200 overflow-hidden mb-1">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-right px-3 py-2 font-semibold text-slate-600">النوع</th>
              <th className="text-center px-2 py-2 font-semibold text-slate-600">الأبعاد (م)</th>
              <th className="text-center px-2 py-2 font-semibold text-slate-600">العدد</th>
              <th className="text-center px-2 py-2 font-semibold text-slate-600">الحجم (م³)</th>
              <th className="text-center px-2 py-2 font-semibold text-slate-600">الحديد (كجم)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {section.elements.map((r, i) => (
              <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                <td className="px-3 py-2 font-medium text-slate-700">{r.label}</td>
                <td className="px-2 py-2 text-center text-slate-500">{r.dim1}×{r.dim2}×{r.dim3}</td>
                <td className="px-2 py-2 text-center text-slate-600">{r.quantity}</td>
                <td className="px-2 py-2 text-center font-semibold text-blue-700">{fmt(r.totalVolume)}</td>
                <td className="px-2 py-2 text-center font-semibold text-slate-700">{fmt(r.steelKg, 1)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className={`border-t-2 ${hdr}`}>
            <tr>
              <td colSpan={3} className="px-3 py-2 font-bold text-right">إجمالي {title}</td>
              <td className="px-2 py-2 text-center font-bold">{fmt(section.totalVolume)}</td>
              <td className="px-2 py-2 text-center font-bold">{fmt(section.totalSteelKg, 1)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function FloorCard({ breakdown }: { breakdown: FloorBreakdown }) {
  const [open, setOpen] = useState(false);
  const hasData = breakdown.totalVolume > 0;
  if (!hasData) return null;

  const rows = [
    { label: "🟦 القواعد",        sec: breakdown.footings,    color: "bg-blue-50 border-blue-200 text-blue-800" },
    { label: "🟧 الأعمدة",        sec: breakdown.columns,     color: "bg-orange-50 border-orange-200 text-orange-800" },
    { label: "🟩 الكمرات",        sec: breakdown.beams,       color: "bg-green-50 border-green-200 text-green-800" },
    { label: "🟣 مصمتة",          sec: breakdown.solidSlabs,  color: "bg-purple-50 border-purple-200 text-purple-800" },
    { label: "🔴 مجوفة",          sec: breakdown.hollowSlabs, color: "bg-rose-50 border-rose-200 text-rose-800" },
    { label: "🟢 مسطحة",          sec: breakdown.flatSlabs,   color: "bg-teal-50 border-teal-200 text-teal-800" },
    { label: "🟡 واف",            sec: breakdown.waffleSlabs, color: "bg-amber-50 border-amber-200 text-amber-800" },
  ].filter((r) => r.sec.elements.length > 0);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-right">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
            {breakdown.floor.name.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800">{breakdown.floor.name}</p>
            <p className="text-xs text-slate-500">
              {fmt(breakdown.totalVolume)} م³ خرسانة &nbsp;•&nbsp; {fmt(breakdown.totalSteelTons, 3)} طن حديد
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
            {fmt(breakdown.totalCost)}
          </span>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-4 bg-white">
          {rows.map((row) => (
            <SectionTable key={row.label} section={row.sec} title={row.label} colorClass={row.color} />
          ))}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-600 font-medium mb-0.5">خرسانة</p>
              <p className="text-sm font-bold text-blue-800">{fmt(breakdown.totalVolume)} م³</p>
            </div>
            <div className="bg-slate-100 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-600 font-medium mb-0.5">حديد</p>
              <p className="text-sm font-bold text-slate-800">{fmt(breakdown.totalSteelTons, 3)} طن</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-green-600 font-medium mb-0.5">تكلفة الطابق</p>
              <p className="text-sm font-bold text-green-800">{fmt(breakdown.totalCost)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("footings");
  const [slabSubTab, setSlabSubTab] = useState<SlabSubType>("solid");
  const [project, setProject] = useState<ProjectInfo>(initialProject);
  const [floors, setFloors] = useState<Floor[]>(initialFloors);

  const [footings,    setFootings]    = useState<ElementType[]>([newElement()]);
  const [columns,     setColumns]     = useState<ElementType[]>([newElement()]);
  const [beams,       setBeams]       = useState<ElementType[]>([newElement()]);
  const [solidSlabs,  setSolidSlabs]  = useState<ElementType[]>([newElement()]);
  const [hollowSlabs, setHollowSlabs] = useState<ElementType[]>([newElement()]);
  const [flatSlabs,   setFlatSlabs]   = useState<ElementType[]>([newElement()]);
  const [waffleSlabs, setWaffleSlabs] = useState<ElementType[]>([newElement()]);

  const [summary, setSummary] = useState<FullSummary | null>(null);
  const [exporting, setExporting] = useState(false);
  const [resultsTab, setResultsTab] = useState<"byType" | "byFloor" | "boq">("byFloor");
  const resultsRef = useRef<HTMLDivElement>(null);

  const [mix, setMix] = useState<MixDesign>(initialMix);
  const [includeSteel, setIncludeSteel] = useState(true);

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(lsLoad);
  const [showPanel, setShowPanel] = useState(false);
  const [saveInput, setSaveInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  type MainStateMap = Record<Exclude<TabId, "slabs">, [ElementType[], React.Dispatch<React.SetStateAction<ElementType[]>>]>;
  type SlabStateMap = Record<SlabSubType, [ElementType[], React.Dispatch<React.SetStateAction<ElementType[]>>]>;

  const mainStateMap: MainStateMap = {
    footings: [footings, setFootings],
    columns:  [columns,  setColumns],
    beams:    [beams,    setBeams],
  };
  const slabStateMap: SlabStateMap = {
    solid:  [solidSlabs,  setSolidSlabs],
    hollow: [hollowSlabs, setHollowSlabs],
    flat:   [flatSlabs,   setFlatSlabs],
    waffle: [waffleSlabs, setWaffleSlabs],
  };

  const allSetters = [setFootings, setColumns, setBeams, setSolidSlabs, setHollowSlabs, setFlatSlabs, setWaffleSlabs];

  function handleProjectChange(e: React.ChangeEvent<HTMLInputElement>) {
    setProject((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSummary(null);
  }

  function handleElementChange(
    setter: React.Dispatch<React.SetStateAction<ElementType[]>>,
    id: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setter((es) => es.map((el) => el.id === id ? { ...el, [e.target.name]: e.target.value } : el));
    setSummary(null);
  }

  function addElement(setter: React.Dispatch<React.SetStateAction<ElementType[]>>, defaultFloorId: string) {
    setter((es) => [...es, newElement(defaultFloorId)]);
  }

  function removeElement(elements: ElementType[], setter: React.Dispatch<React.SetStateAction<ElementType[]>>, id: string) {
    if (elements.length === 1) return;
    setter((es) => es.filter((e) => e.id !== id));
    setSummary(null);
  }

  function addFloor() {
    const num = floors.length + 1;
    const names = ["الدور الأرضي", "الدور الأول", "الدور الثاني", "الدور الثالث", "الدور الرابع", "الدور الخامس", "الدور السادس", "الدور السابع", "الدور الثامن", "الدور التاسع"];
    const name = names[num - 1] ?? `الدور ${num - 1}`;
    setFloors((fs) => [...fs, { id: crypto.randomUUID(), name }]);
  }

  function removeFloor(floorId: string) {
    if (floors.length === 1) return;
    const fallback = floors.find((f) => f.id !== floorId)!.id;
    setFloors((fs) => fs.filter((f) => f.id !== floorId));
    allSetters.forEach((setter) => setter((es) => es.map((e) => e.floorId === floorId ? { ...e, floorId: fallback } : e)));
    setSummary(null);
  }

  function renameFloor(floorId: string, name: string) {
    setFloors((fs) => fs.map((f) => f.id === floorId ? { ...f, name } : f));
  }

  function saveProject() {
    const name = saveInput.trim() || project.projectName.trim() || `مشروع ${savedProjects.length + 1}`;
    const entry: SavedProject = {
      id: crypto.randomUUID(), name, savedAt: Date.now(),
      project, floors, footings, columns, beams,
      solidSlabs, hollowSlabs, flatSlabs, waffleSlabs, mix, includeSteel,
    };
    const updated = [entry, ...savedProjects];
    lsSave(updated);
    setSavedProjects(updated);
    setSaveInput("");
  }

  function loadProject(sp: SavedProject) {
    setProject(sp.project);
    setFloors(sp.floors);
    setFootings(sp.footings);
    setColumns(sp.columns);
    setBeams(sp.beams);
    setSolidSlabs(sp.solidSlabs);
    setHollowSlabs(sp.hollowSlabs);
    setFlatSlabs(sp.flatSlabs);
    setWaffleSlabs(sp.waffleSlabs);
    if (sp.mix) setMix(sp.mix);
    if (sp.includeSteel !== undefined) setIncludeSteel(sp.includeSteel);
    setSummary(null);
    setActiveTab("footings");
    setSlabSubTab("solid");
    setShowPanel(false);
  }

  function deleteProject(id: string) {
    const updated = savedProjects.filter((sp) => sp.id !== id);
    lsSave(updated);
    setSavedProjects(updated);
    setDeleteConfirm(null);
  }

  function exportProjectsJSON() {
    const blob = new Blob([JSON.stringify(savedProjects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "structural-projects.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function importProjectsJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as SavedProject[];
        const merged = [...imported, ...savedProjects].filter(
          (p, i, arr) => arr.findIndex((q) => q.id === p.id) === i
        );
        lsSave(merged); setSavedProjects(merged);
      } catch { /* ignore bad file */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const allElements = [...footings, ...columns, ...beams, ...solidSlabs, ...hollowSlabs, ...flatSlabs, ...waffleSlabs];

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (allElements.some(isElementValid) && isPricesValid(project, includeSteel)) {
      const calcProject = includeSteel ? project : {
        ...project,
        steelPricePerTon: "0",
        footingSteelRatio: "0",
        columnSteelRatio: "0",
        beamSteelRatio: "0",
        solidSlabSteelRatio: "0",
        hollowSlabSteelRatio: "0",
        flatSlabSteelRatio: "0",
        waffleSlabSteelRatio: "0",
      };
      setSummary(computeFull(footings, columns, beams, solidSlabs, hollowSlabs, flatSlabs, waffleSlabs, floors, calcProject));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }

  function handleReset() {
    setProject(initialProject);
    setFloors(initialFloors);
    setMix(initialMix);
    setIncludeSteel(true);
    setFootings([newElement()]);
    setColumns([newElement()]);
    setBeams([newElement()]);
    setSolidSlabs([newElement()]);
    setHollowSlabs([newElement()]);
    setFlatSlabs([newElement()]);
    setWaffleSlabs([newElement()]);
    setSummary(null);
    setActiveTab("footings");
    setSlabSubTab("solid");
  }

  async function handleExportPDF() {
    if (!resultsRef.current || !summary) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin       = 12;
      const contentWidth = pageWidth - margin * 2;
      const FIRST_HEADER_H  = 50;  // tall header with meta on page 1
      const CONT_HEADER_H   = 18;  // slim header on continuation pages
      const FOOTER_H        = 10;
      const firstAvailMm  = pageHeight - FIRST_HEADER_H - FOOTER_H - margin;
      const contAvailMm   = pageHeight - CONT_HEADER_H  - FOOTER_H - margin;
      const pxPerMm       = canvas.width / contentWidth;
      const firstAvailPx  = Math.round(firstAvailMm  * pxPerMm);
      const contAvailPx   = Math.round(contAvailMm   * pxPerMm);

      const dateStr = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

      // ── helpers ──────────────────────────────────────────────────────────────
      function drawBigHeader() {
        pdf.setFillColor(37, 99, 235);
        pdf.rect(0, 0, pageWidth, 34, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(15); pdf.setFont("helvetica", "bold");
        pdf.text(project.projectName || "Structural Quantity Report", pageWidth / 2, 13, { align: "center" });
        pdf.setFontSize(9);  pdf.setFont("helvetica", "normal");
        pdf.text("Foundations  •  Columns  •  Beams  •  Slabs — Structural Calculator", pageWidth / 2, 23, { align: "center" });
        // meta row
        pdf.setTextColor(51, 65, 85); pdf.setFontSize(8);
        const metaY = 43;
        pdf.text(dateStr, pageWidth - margin, metaY, { align: "right" });
        if (project.engineerName) pdf.text(`Eng: ${project.engineerName}`, margin, metaY);
        if (project.clientName)   pdf.text(`Client: ${project.clientName}`, project.engineerName ? pageWidth / 2 : margin, metaY);
        pdf.setDrawColor(226, 232, 240); pdf.setLineWidth(0.3);
        pdf.line(margin, FIRST_HEADER_H - 3, pageWidth - margin, FIRST_HEADER_H - 3);
      }

      function drawSlimHeader(pageNum: number) {
        pdf.setFillColor(37, 99, 235);
        pdf.rect(0, 0, pageWidth, CONT_HEADER_H, "F");
        pdf.setTextColor(255, 255, 255); pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
        pdf.text(project.projectName || "Structural Quantity Report", pageWidth / 2, 11, { align: "center" });
        pdf.setFontSize(7); pdf.setFont("helvetica", "normal");
        pdf.text(`Page ${pageNum}`, pageWidth - margin, 11, { align: "right" });
      }

      function drawFooter(pageNum: number, totalPages: number) {
        pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
        pdf.text("Generated by Structural Quantity Calculator", margin, pageHeight - 5);
        pdf.text(`${pageNum} / ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: "right" });
      }

      function sliceAndAdd(srcCanvas: HTMLCanvasElement, yPx: number, heightPx: number, destY: number, destH: number): string {
        const tmp = document.createElement("canvas");
        tmp.width  = srcCanvas.width;
        tmp.height = heightPx;
        tmp.getContext("2d")!.drawImage(srcCanvas, 0, yPx, srcCanvas.width, heightPx, 0, 0, srcCanvas.width, heightPx);
        return tmp.toDataURL("image/png");
      }

      // ── count pages needed for the screenshot ─────────────────────────────
      let pagesNeeded = 1;
      if (canvas.height > firstAvailPx) {
        pagesNeeded += Math.ceil((canvas.height - firstAvailPx) / contAvailPx);
      }
      const totalPages = pagesNeeded + 1; // +1 for mix design page

      // ── page 1: big header + first slice ─────────────────────────────────
      drawBigHeader();
      const p1HeightPx  = Math.min(firstAvailPx, canvas.height);
      const p1HeightMm  = p1HeightPx / pxPerMm;
      const p1Img = sliceAndAdd(canvas, 0, p1HeightPx, FIRST_HEADER_H, p1HeightMm);
      pdf.addImage(p1Img, "PNG", margin, FIRST_HEADER_H, contentWidth, p1HeightMm);
      drawFooter(1, totalPages);

      // ── continuation pages ────────────────────────────────────────────────
      let yPixel = firstAvailPx;
      let pageNum = 2;
      while (yPixel < canvas.height) {
        pdf.addPage();
        drawSlimHeader(pageNum);
        const sliceH = Math.min(contAvailPx, canvas.height - yPixel);
        const sliceHmm = sliceH / pxPerMm;
        const img = sliceAndAdd(canvas, yPixel, sliceH, CONT_HEADER_H, sliceHmm);
        pdf.addImage(img, "PNG", margin, CONT_HEADER_H, contentWidth, sliceHmm);
        drawFooter(pageNum, totalPages);
        yPixel  += sliceH;
        pageNum += 1;
      }

      // ── final page: programmatic mix design summary ───────────────────────
      pdf.addPage();
      const mr = computeMix(summary.totalConcreteVolume, mix);
      const ratioLabel = `${mix.cement} : ${mix.sand} : ${mix.gravel}`;

      // header band
      pdf.setFillColor(234, 88, 12); // orange-600
      pdf.rect(0, 0, pageWidth, 34, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14); pdf.setFont("helvetica", "bold");
      pdf.text("Concrete Mix Design — Material Quantities", pageWidth / 2, 13, { align: "center" });
      pdf.setFontSize(9); pdf.setFont("helvetica", "normal");
      pdf.text(`Mix Ratio  ${ratioLabel}  (Cement : Sand : Gravel)  •  Compaction factor ${mix.compactionFactor}`, pageWidth / 2, 24, { align: "center" });

      // meta
      pdf.setTextColor(51, 65, 85); pdf.setFontSize(8);
      pdf.text(dateStr, pageWidth - margin, 43, { align: "right" });
      if (project.projectName) pdf.text(project.projectName, margin, 43);
      pdf.setDrawColor(253, 186, 116); pdf.setLineWidth(0.4);
      pdf.line(margin, 47, pageWidth - margin, 47);

      let y = 58;

      // total concrete callout
      pdf.setFillColor(255, 247, 237); // orange-50
      pdf.setDrawColor(253, 186, 116);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, y, contentWidth, 20, 3, 3, "FD");
      pdf.setTextColor(154, 52, 18); pdf.setFontSize(10); pdf.setFont("helvetica", "bold");
      pdf.text("Total Concrete Volume", margin + 6, y + 8);
      pdf.setFontSize(14);
      pdf.text(`${summary.totalConcreteVolume.toFixed(3)} m\xB3`, pageWidth - margin - 6, y + 10, { align: "right" });
      pdf.setFontSize(8.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(120, 53, 15);
      pdf.text(`Dry volume required (x${mix.compactionFactor}): ${mr.dryVolume.toFixed(3)} m\xB3`, margin + 6, y + 16);
      y += 28;

      // ── 3 big result boxes ────────────────────────────────────────────────
      type Box = { bg: [number,number,number]; border: [number,number,number]; titleColor: [number,number,number]; numColor: [number,number,number]; label: string; value: string; sub1: string; sub2: string };
      const boxes: Box[] = [
        {
          bg: [255, 237, 213], border: [251, 146, 60],
          titleColor: [154, 52, 18], numColor: [124, 45, 18],
          label: "Cement Bags",
          value: `${mr.cementBags}`,
          sub1: `${mix.bagWeightKg} kg / bag`,
          sub2: `Vol: ${mr.cementVolume.toFixed(3)} m\xB3`,
        },
        {
          bg: [254, 252, 232], border: [234, 179, 8],
          titleColor: [113, 63, 18], numColor: [92, 50, 10],
          label: "Sand Volume",
          value: `${mr.sandVolume.toFixed(3)} m\xB3`,
          sub1: `\u2248 ${(mr.sandVolume * 1.6).toFixed(1)} tons`,
          sub2: `Ratio part: ${mix.sand}`,
        },
        {
          bg: [241, 245, 249], border: [148, 163, 184],
          titleColor: [51, 65, 85], numColor: [30, 41, 59],
          label: "Gravel Volume",
          value: `${mr.gravelVolume.toFixed(3)} m\xB3`,
          sub1: `\u2248 ${(mr.gravelVolume * 1.55).toFixed(1)} tons`,
          sub2: `Ratio part: ${mix.gravel}`,
        },
      ];

      const boxW = (contentWidth - 8) / 3;
      boxes.forEach((b, i) => {
        const bx = margin + i * (boxW + 4);
        pdf.setFillColor(...b.bg);
        pdf.setDrawColor(...b.border);
        pdf.setLineWidth(0.6);
        pdf.roundedRect(bx, y, boxW, 52, 4, 4, "FD");
        // label
        pdf.setTextColor(...b.titleColor);
        pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
        pdf.text(b.label, bx + boxW / 2, y + 10, { align: "center" });
        // big number
        pdf.setTextColor(...b.numColor);
        pdf.setFontSize(i === 0 ? 24 : 18); pdf.setFont("helvetica", "bold");
        pdf.text(b.value, bx + boxW / 2, y + 30, { align: "center" });
        // subs
        pdf.setFontSize(8); pdf.setFont("helvetica", "normal"); pdf.setTextColor(...b.titleColor);
        pdf.text(b.sub1, bx + boxW / 2, y + 41, { align: "center" });
        pdf.text(b.sub2, bx + boxW / 2, y + 48, { align: "center" });
      });
      y += 60;

      // ── per-m³ reference table ────────────────────────────────────────────
      pdf.setFillColor(255, 250, 235);
      pdf.setDrawColor(251, 191, 36);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(margin, y, contentWidth, 8, 2, 2, "FD");
      pdf.setTextColor(120, 53, 15); pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
      pdf.text("Per 1 m\xB3 of Concrete — Reference Quantities", margin + 4, y + 5.5);
      y += 12;

      const perM = computeMix(1, mix);
      const refRows = [
        ["Material", "Quantity", "Unit"],
        ["Cement", `${perM.cementBags} bags  (${perM.cementVolume.toFixed(4)} m\xB3)`, `${mix.bagWeightKg} kg/bag`],
        ["Sand",   `${perM.sandVolume.toFixed(4)} m\xB3`,  `≈ ${(perM.sandVolume * 1600).toFixed(0)} kg`],
        ["Gravel", `${perM.gravelVolume.toFixed(4)} m\xB3`, `≈ ${(perM.gravelVolume * 1550).toFixed(0)} kg`],
      ];
      const colX = [margin, margin + contentWidth * 0.38, margin + contentWidth * 0.72];
      const rowH = 9;
      refRows.forEach((row, ri) => {
        const isHeader = ri === 0;
        if (isHeader) {
          pdf.setFillColor(251, 191, 36);
          pdf.rect(margin, y, contentWidth, rowH, "F");
          pdf.setTextColor(92, 50, 10); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5);
        } else {
          pdf.setFillColor(ri % 2 === 0 ? 255 : 255, ri % 2 === 0 ? 253 : 250, ri % 2 === 0 ? 235 : 240);
          pdf.rect(margin, y, contentWidth, rowH, "F");
          pdf.setTextColor(51, 65, 85); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5);
        }
        row.forEach((cell, ci) => pdf.text(cell, colX[ci] + 3, y + 6.2));
        pdf.setDrawColor(253, 186, 116); pdf.setLineWidth(0.2);
        pdf.line(margin, y + rowH, margin + contentWidth, y + rowH);
        y += rowH;
      });
      y += 10;

      // ── structural totals row ─────────────────────────────────────────────
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(margin, y, contentWidth, 22, 3, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
      const cols3 = [margin + contentWidth * 0.02, margin + contentWidth * 0.35, margin + contentWidth * 0.68];
      const vals3 = [
        ["Total Concrete",  `${summary.totalConcreteVolume.toFixed(3)} m\xB3`],
        ["Total Steel",     `${summary.totalSteelTons.toFixed(3)} tons`],
        ["Grand Total Cost",`${summary.grandTotal.toFixed(2)}`],
      ];
      vals3.forEach(([lbl, val], i) => {
        pdf.setTextColor(148, 163, 184); pdf.setFontSize(7.5); pdf.setFont("helvetica", "normal");
        pdf.text(lbl, cols3[i], y + 8);
        pdf.setTextColor(255, 255, 255); pdf.setFontSize(11); pdf.setFont("helvetica", "bold");
        pdf.text(val, cols3[i], y + 18);
      });

      drawFooter(totalPages, totalPages);

      // ── BOQ pages ─────────────────────────────────────────────────────────
      const boqItems = computeBOQ(
        summary, floors,
        [footings, columns, beams, solidSlabs, hollowSlabs, flatSlabs, waffleSlabs],
        parseFloat(project.concretePricePerM3) || 0,
        parseFloat(project.steelPricePerTon)   || 0,
      );
      if (boqItems.length > 0) {
        // Column definitions [header, x-offset from margin, width, align]
        type Col = { h: string; x: number; w: number; align: "left" | "center" | "right" };
        const cols: Col[] = [
          { h: "#",        x: 0,    w: 9,   align: "center" },
          { h: "Type",     x: 9,    w: 18,  align: "left"   },
          { h: "Floor",    x: 27,   w: 22,  align: "left"   },
          { h: "Label",    x: 49,   w: 22,  align: "left"   },
          { h: "L x W x H (m)",  x: 71, w: 38, align: "center" },
          { h: "Qty",      x: 109,  w: 10,  align: "center" },
          { h: "Vol/unit", x: 119,  w: 20,  align: "center" },
          { h: "Total Vol",x: 139,  w: 22,  align: "center" },
          { h: "Steel kg", x: 161,  w: 15,  align: "center" },
          { h: "Cost",     x: 176,  w: 22,  align: "right"  },
        ];

        const BOQ_HEADER_H  = 28;
        const BOQ_CONT_H    = 18;
        const ROW_H         = 7;
        const HEADER_ROW_H  = 9;
        const FOOTER_H2     = 10;
        const firstBodyY    = BOQ_HEADER_H + HEADER_ROW_H;
        const contBodyY     = BOQ_CONT_H   + HEADER_ROW_H;
        const firstRowsPerPage = Math.floor((pageHeight - firstBodyY - FOOTER_H2 - margin) / ROW_H);
        const contRowsPerPage  = Math.floor((pageHeight - contBodyY  - FOOTER_H2 - margin) / ROW_H);

        const boqTotalPages = Math.ceil(
          boqItems.length <= firstRowsPerPage
            ? 1
            : 1 + Math.ceil((boqItems.length - firstRowsPerPage) / contRowsPerPage)
        );

        function drawBOQHeader(isFirstBOQ: boolean, pgLabel: string) {
          const hh = isFirstBOQ ? BOQ_HEADER_H : BOQ_CONT_H;
          pdf.setFillColor(22, 163, 74); // green-600
          pdf.rect(0, 0, pageWidth, hh, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(isFirstBOQ ? 13 : 9); pdf.setFont("helvetica", "bold");
          pdf.text("Bill of Quantities (BOQ)", pageWidth / 2, isFirstBOQ ? 12 : 11, { align: "center" });
          if (isFirstBOQ) {
            pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
            pdf.text(project.projectName || "Structural Quantity Report", pageWidth / 2, 21, { align: "center" });
          }
          pdf.setFontSize(7);
          pdf.text(pgLabel, pageWidth - margin, isFirstBOQ ? 21 : 11, { align: "right" });
        }

        function drawColHeaders(bodyY: number) {
          pdf.setFillColor(30, 41, 59);
          pdf.rect(margin, bodyY - HEADER_ROW_H, contentWidth, HEADER_ROW_H, "F");
          pdf.setTextColor(255, 255, 255); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
          cols.forEach((col) => {
            const cx = margin + col.x + (col.align === "center" ? col.w / 2 : col.align === "right" ? col.w - 1 : 1);
            pdf.text(col.h, cx, bodyY - 2.5, { align: col.align });
          });
        }

        function drawBOQFooter(pg: number, total: number) {
          pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
          pdf.text("Generated by Structural Quantity Calculator", margin, pageHeight - 5);
          pdf.text(`BOQ  ${pg} / ${total}`, pageWidth - margin, pageHeight - 5, { align: "right" });
        }

        const TYPE_COLORS_PDF: Record<string, [number,number,number]> = {
          F:  [239, 246, 255],  C:  [255, 247, 237],  B:  [240, 253, 244],
          SS: [250, 245, 255],  HS: [255, 241, 242],  FS: [240, 253, 250],
          WS: [255, 251, 235],
        };

        // page 1
        pdf.addPage();
        const pg1Label = `Page 1 / ${boqTotalPages}`;
        drawBOQHeader(true, pg1Label);
        drawColHeaders(firstBodyY);

        let rowY  = firstBodyY + ROW_H * 0.85;
        let rowIdx = 0;
        let boqPage = 1;

        function renderRow(item: BOQItem) {
          const bg = TYPE_COLORS_PDF[item.typeCode] ?? [255, 255, 255];
          pdf.setFillColor(...bg);
          pdf.rect(margin, rowY - ROW_H * 0.8, contentWidth, ROW_H, "F");
          pdf.setDrawColor(226, 232, 240); pdf.setLineWidth(0.15);
          pdf.line(margin, rowY - ROW_H * 0.8 + ROW_H, margin + contentWidth, rowY - ROW_H * 0.8 + ROW_H);
          pdf.setTextColor(51, 65, 85); pdf.setFontSize(7); pdf.setFont("helvetica", "normal");
          const cells = [
            { val: String(item.no),                         col: cols[0] },
            { val: item.typeCode,                           col: cols[1] },
            { val: item.floorName.slice(0, 12),             col: cols[2] },
            { val: item.label.slice(0, 10),                 col: cols[3] },
            { val: `${item.dim1.toFixed(2)}x${item.dim2.toFixed(2)}x${item.dim3.toFixed(2)}`, col: cols[4] },
            { val: String(item.qty),                        col: cols[5] },
            { val: item.volEach.toFixed(3),                 col: cols[6] },
            { val: item.volTotal.toFixed(3),                col: cols[7] },
            { val: item.steelKgTotal.toFixed(1),            col: cols[8] },
            { val: item.costTotal.toFixed(2),               col: cols[9] },
          ];
          cells.forEach(({ val, col }) => {
            const cx = margin + col.x + (col.align === "center" ? col.w / 2 : col.align === "right" ? col.w - 1 : 1);
            pdf.text(val, cx, rowY, { align: col.align });
          });
          rowY += ROW_H;
          rowIdx++;
        }

        const maxRowsOnPage = (isFirst: boolean) => isFirst ? firstRowsPerPage : contRowsPerPage;

        while (rowIdx < boqItems.length) {
          const isFirst = boqPage === 1;
          const bodyYStart = isFirst ? firstBodyY : contBodyY;
          const maxRows = maxRowsOnPage(isFirst);

          // check if we need a new page (not on first iteration since page was already added)
          if (rowIdx > 0 && rowIdx >= firstRowsPerPage + (boqPage - 2) * contRowsPerPage) {
            pdf.addPage(); boqPage++;
            drawBOQHeader(false, `Page ${boqPage} / ${boqTotalPages}`);
            drawColHeaders(contBodyY);
            rowY = contBodyY + ROW_H * 0.85;
          } else if (rowIdx === 0) {
            // already on the page
          }

          const endRow = rowIdx + maxRows;
          while (rowIdx < boqItems.length && rowIdx < endRow) {
            renderRow(boqItems[rowIdx]);
          }

          drawBOQFooter(boqPage, boqTotalPages);

          // if still more rows, loop will add next page
          if (rowIdx >= boqItems.length) break;
          pdf.addPage(); boqPage++;
          drawBOQHeader(false, `Page ${boqPage} / ${boqTotalPages}`);
          drawColHeaders(contBodyY);
          rowY = contBodyY + ROW_H * 0.85;
        }

        // Totals row on last BOQ page
        const totY = rowY + 2;
        pdf.setFillColor(22, 163, 74);
        pdf.rect(margin, totY - ROW_H * 0.8, contentWidth, ROW_H + 1, "F");
        pdf.setTextColor(255, 255, 255); pdf.setFontSize(7.5); pdf.setFont("helvetica", "bold");
        pdf.text("TOTAL", margin + 2, totY + 1);
        pdf.text(boqItems.reduce((s, r) => s + r.volTotal, 0).toFixed(3),
          margin + cols[7].x + cols[7].w / 2, totY + 1, { align: "center" });
        pdf.text(boqItems.reduce((s, r) => s + r.steelKgTotal, 0).toFixed(1),
          margin + cols[8].x + cols[8].w / 2, totY + 1, { align: "center" });
        pdf.text(boqItems.reduce((s, r) => s + r.costTotal, 0).toFixed(2),
          margin + cols[9].x + cols[9].w - 1, totY + 1, { align: "right" });
      }

      pdf.save(`structural-report-${project.projectName ? project.projectName.replace(/\s+/g, "-") : Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  const canCalculate = allElements.some(isElementValid) && isPricesValid(project);
  const activeSlabConfig = SLAB_SUBTYPES.find((s) => s.id === slabSubTab)!;
  const [activeSlabElements, activeSlabSetter] = slabStateMap[slabSubTab];
  const defaultFloorId = floors[0]?.id ?? DEFAULT_FLOOR_ID;

  const sectionHasData = (tab: TabId) => {
    if (tab === "slabs") return [...solidSlabs, ...hollowSlabs, ...flatSlabs, ...waffleSlabs].some(isElementValid);
    return mainStateMap[tab as Exclude<TabId, "slabs">][0].some(isElementValid);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl py-8">

        {/* Saved Projects Drawer */}
        {showPanel && (
          <div className="fixed inset-0 z-50 flex" dir="rtl">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPanel(false)} />
            {/* Panel */}
            <div className="relative mr-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-blue-600">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8m-9 4v4m4-4v4" />
                  </svg>
                  المشاريع المحفوظة
                </h2>
                <button onClick={() => setShowPanel(false)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Save current project */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">حفظ المشروع الحالي</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={saveInput}
                    onChange={(e) => setSaveInput(e.target.value)}
                    placeholder={project.projectName || "اسم المشروع..."}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    onClick={saveProject}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    حفظ
                  </button>
                </div>
              </div>

              {/* Project list */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {savedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                    <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm">لا توجد مشاريع محفوظة بعد</p>
                  </div>
                ) : savedProjects.map((sp) => (
                  <div key={sp.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{sp.name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(sp.savedAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                          {" — "}
                          {sp.floors.length} {sp.floors.length === 1 ? "طابق" : "طوابق"}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => loadProject(sp)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="تحميل">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </button>
                        {deleteConfirm === sp.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => deleteProject(sp.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg font-semibold">حذف</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg">إلغاء</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(sp.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="حذف">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Export / Import */}
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                <button
                  onClick={exportProjectsJSON}
                  disabled={savedProjects.length === 0}
                  className="flex-1 py-2 px-3 text-xs font-semibold bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 rounded-lg transition disabled:opacity-40 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  تصدير JSON
                </button>
                <label className="flex-1 py-2 px-3 text-xs font-semibold bg-white border border-slate-200 hover:border-green-300 hover:text-green-600 text-slate-600 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  استيراد JSON
                  <input type="file" accept=".json" className="hidden" onChange={importProjectsJSON} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">حاسبة الكميات الإنشائية</h1>
          <p className="text-slate-500 mt-1 text-sm">قواعد • أعمدة • كمرات • بلاطات</p>
          <button
            type="button"
            onClick={() => { setShowPanel(true); setDeleteConfirm(null); }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 text-sm font-semibold rounded-xl shadow-sm transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8m-9 4v4m4-4v4" />
            </svg>
            المشاريع المحفوظة
            {savedProjects.length > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                {savedProjects.length}
              </span>
            )}
          </button>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">

          {/* Project Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              بيانات المشروع والتوثيق
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">اسم المشروع <span className="text-slate-400">(اختياري)</span></label>
                <input type="text" name="projectName" value={project.projectName} onChange={handleProjectChange}
                  placeholder="مثال: مشروع فلل الريان"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">اسم المهندس <span className="text-slate-400">(اختياري)</span></label>
                  <input type="text" name="engineerName" value={project.engineerName} onChange={handleProjectChange}
                    placeholder="م. ماجد القبضة"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">اسم العميل <span className="text-slate-400">(اختياري)</span></label>
                  <input type="text" name="clientName" value={project.clientName} onChange={handleProjectChange}
                    placeholder="المقاول / صاحب العمل"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
                </div>
              </div>
            </div>
          </div>

          {/* Floor Manager */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                الطوابق
              </h2>
              <button type="button" onClick={addFloor}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                إضافة طابق
              </button>
            </div>
            <div className="space-y-2">
              {floors.map((floor, idx) => (
                <div key={floor.id} className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                  <input
                    type="text"
                    value={floor.name}
                    onChange={(e) => renameFloor(floor.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
                  {floors.length > 1 && (
                    <button type="button" onClick={() => removeFloor(floor.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">سيُطلب منك تحديد الطابق لكل عنصر عند الإدخال</p>
          </div>

          {/* Prices & Ratios */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                أسعار المواد ومعدلات الحديد
              </h2>
              {/* Steel toggle */}
              <button type="button" onClick={() => setIncludeSteel((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition ${
                  includeSteel
                    ? "bg-slate-800 border-slate-800 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}>
                <span className={`inline-block w-8 h-4 rounded-full relative transition-colors ${includeSteel ? "bg-blue-400" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${includeSteel ? "right-0.5" : "left-0.5"}`} />
                </span>
                {includeSteel ? "حديد التسليح: مفعّل" : "خرسانة فقط"}
              </button>
            </div>
            <div className={`grid gap-3 mb-4 ${includeSteel ? "grid-cols-2" : "grid-cols-1"}`}>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">سعر م³ الخرسانة</label>
                <input type="number" name="concretePricePerM3" value={project.concretePricePerM3} onChange={handleProjectChange}
                  placeholder="0.00" min="0.01" step="0.01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
              </div>
              {includeSteel && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">سعر طن الحديد</label>
                  <input type="number" name="steelPricePerTon" value={project.steelPricePerTon} onChange={handleProjectChange}
                    placeholder="0.00" min="0.01" step="0.01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
                </div>
              )}
            </div>
            {includeSteel && <>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">معدلات حديد العناصر الإنشائية (كجم/م³)</p>
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl mb-3">
                {[
                  { name: "footingSteelRatio", label: "القواعد",  placeholder: "80"  },
                  { name: "columnSteelRatio",  label: "الأعمدة", placeholder: "120" },
                  { name: "beamSteelRatio",    label: "الكمرات", placeholder: "150" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                    <input type="number" name={f.name} value={project[f.name as keyof ProjectInfo]} onChange={handleProjectChange}
                      placeholder={f.placeholder} min="1" step="1"
                      className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">معدلات حديد البلاطات (كجم/م³)</p>
            <div className="p-3 bg-purple-50/60 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "solidSlabSteelRatio",  label: "🔵 بلاطة مصمتة", placeholder: "90"  },
                  { name: "hollowSlabSteelRatio",  label: "🔴 بلاطة مجوفة", placeholder: "50"  },
                  { name: "flatSlabSteelRatio",    label: "🟢 بلاطة مسطحة", placeholder: "110" },
                  { name: "waffleSlabSteelRatio",  label: "🟡 بلاطة واف",   placeholder: "85"  },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                    <input type="number" name={f.name} value={project[f.name as keyof ProjectInfo]} onChange={handleProjectChange}
                      placeholder={f.placeholder} min="1" step="1"
                      className="w-full px-2 py-2 border border-purple-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition text-center" />
                  </div>
                ))}
              </div>
              <div className="border-t border-purple-200 pt-3">
                <p className="text-xs font-medium text-slate-500 mb-2">نسبة الخرسانة الفعلية (للمجوفة والواف)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">🔴 مجوفة</label>
                    <input type="number" name="hollowConcreteRatio" value={project.hollowConcreteRatio} onChange={handleProjectChange}
                      placeholder="0.55" min="0.1" max="1" step="0.01"
                      className="w-full px-2 py-2 border border-purple-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition text-center" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">🟡 واف</label>
                    <input type="number" name="waffleConcreteRatio" value={project.waffleConcreteRatio} onChange={handleProjectChange}
                      placeholder="0.65" min="0.1" max="1" step="0.01"
                      className="w-full px-2 py-2 border border-purple-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition text-center" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">القيمة بين 0.1 و 1 — مثال: 0.55 تعني 55% خرسانة صلبة</p>
              </div>
            </div>
            </>}
          </div>

          {/* Mix Design */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              تصميم الخلطة الخرسانية
            </h2>

            {/* Preset buttons */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">اختر نسبة الخلطة (أسمنت : رمل : زلط)</p>
            <div className="flex gap-2 mb-4">
              {MIX_PRESETS.map((p) => {
                const active = mix.cement === p.c && mix.sand === p.s && mix.gravel === p.g;
                return (
                  <button key={p.label} type="button"
                    onClick={() => setMix((m) => ({ ...m, cement: p.c, sand: p.s, gravel: p.g }))}
                    className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold border-2 transition text-center ${
                      active ? "bg-orange-500 border-orange-500 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600"
                    }`}>
                    <div className="font-bold">{p.label}</div>
                    <div className={`text-xs mt-0.5 ${active ? "text-orange-100" : "text-slate-400"}`}>{p.grade}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom ratio */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">نسبة مخصصة</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { key: "cement" as keyof MixDesign, label: "🟫 أسمنت" },
                { key: "sand"   as keyof MixDesign, label: "🟨 رمل" },
                { key: "gravel" as keyof MixDesign, label: "⬛ زلط" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                  <input type="number" value={mix[key]}
                    onChange={(e) => setMix((m) => ({ ...m, [key]: e.target.value }))}
                    placeholder="1" min="0.1" step="any"
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-center" />
                </div>
              ))}
            </div>

            {/* Advanced settings */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-orange-50/60 rounded-xl">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">معامل الانكماش (جاف/رطب)</label>
                <input type="number" value={mix.compactionFactor}
                  onChange={(e) => setMix((m) => ({ ...m, compactionFactor: e.target.value }))}
                  placeholder="1.54" min="1" max="2" step="0.01"
                  className="w-full px-2 py-2 border border-orange-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-center" />
                <p className="text-xs text-slate-400 mt-1">الافتراضي: 1.54</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">وزن الكيس (كجم)</label>
                <input type="number" value={mix.bagWeightKg}
                  onChange={(e) => setMix((m) => ({ ...m, bagWeightKg: e.target.value }))}
                  placeholder="50" min="1" step="1"
                  className="w-full px-2 py-2 border border-orange-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-center" />
                <p className="text-xs text-slate-400 mt-1">أكياس قياسية: 50 كجم</p>
              </div>
            </div>
          </div>

          {/* Tab Nav */}
          <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
            {MAIN_TABS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${
                  activeTab === tab.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {sectionHasData(tab.id) && (
                  <span className={`w-1.5 h-1.5 rounded-full ${activeTab === tab.id ? "bg-white/70" : "bg-green-500"}`} />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content — non-slab */}
          {activeTab !== "slabs" && (() => {
            const tabCfg = MAIN_TABS.find((t) => t.id === activeTab)!;
            const [elements, setter] = mainStateMap[activeTab as Exclude<TabId, "slabs">];
            return (
              <div className="space-y-3">
                {elements.map((el, idx) => (
                  <ElementCard key={el.id} element={el} idx={idx}
                    dim1Label={tabCfg.dim1Label} dim2Label={tabCfg.dim2Label} dim3Label={tabCfg.dim3Label}
                    defaultLabel={tabCfg.defaultLabel} tabCount={elements.length} floors={floors}
                    onChange={(id, e) => handleElementChange(setter, id, e)}
                    onRemove={(id) => removeElement(elements, setter, id)} />
                ))}
                <button type="button" onClick={() => addElement(setter, defaultFloorId)}
                  className="w-full py-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-500 text-sm font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  إضافة {tabCfg.label.slice(0, -1)}
                </button>
              </div>
            );
          })()}

          {/* Tab Content — slabs */}
          {activeTab === "slabs" && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">اختر نوع البلاطة</p>
                <div className="grid grid-cols-2 gap-2">
                  {SLAB_SUBTYPES.map((st) => (
                    <button key={st.id} type="button" onClick={() => setSlabSubTab(st.id)}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition text-right flex items-center justify-between gap-2 border-2 ${
                        slabSubTab === st.id
                          ? `${st.activeBg} text-white border-transparent shadow-sm`
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}>
                      <span>{st.label}</span>
                      {slabStateMap[st.id][0].some(isElementValid) && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${slabSubTab === st.id ? "bg-white/70" : "bg-green-500"}`} />
                      )}
                    </button>
                  ))}
                </div>
                {activeSlabConfig.note && (
                  <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">ℹ️ {activeSlabConfig.note}</p>
                )}
              </div>
              {activeSlabElements.map((el, idx) => (
                <ElementCard key={el.id} element={el} idx={idx}
                  dim1Label="الطول (م)" dim2Label="العرض (م)" dim3Label="السمك (م)"
                  defaultLabel={activeSlabConfig.defaultLabel}
                  tabCount={activeSlabElements.length} floors={floors}
                  accentColor={activeSlabConfig.color}
                  onChange={(id, e) => handleElementChange(activeSlabSetter, id, e)}
                  onRemove={(id) => removeElement(activeSlabElements, activeSlabSetter, id)} />
              ))}
              <button type="button" onClick={() => addElement(activeSlabSetter, defaultFloorId)}
                className="w-full py-3 border-2 border-dashed border-purple-200 rounded-2xl text-purple-500 text-sm font-medium hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                إضافة {activeSlabConfig.shortLabel}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button type="submit" disabled={!canCalculate}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition shadow-sm text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              احسب الكميات
            </button>
            <button type="button" onClick={handleReset}
              className="py-3.5 px-5 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 font-semibold rounded-2xl transition text-sm">
              إعادة تعيين
            </button>
          </div>
        </form>

        {/* Results */}
        {summary && (
          <div ref={resultsRef} className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">نتائج الحساب</h3>
              <button type="button" onClick={handleExportPDF} disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition shadow-sm">
                {exporting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {exporting ? "جارٍ التصدير..." : "تصدير PDF"}
              </button>
            </div>

            {/* Results view toggle */}
            <div className="flex gap-1.5 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
              <button type="button" onClick={() => setResultsTab("byFloor")}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  resultsTab === "byFloor" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                حسب الطابق
              </button>
              <button type="button" onClick={() => setResultsTab("byType")}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  resultsTab === "byType" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                حسب النوع
              </button>
              <button type="button" onClick={() => setResultsTab("boq")}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  resultsTab === "boq" ? "bg-green-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                جدول الكميات
              </button>
            </div>

            {/* BY FLOOR view */}
            {resultsTab === "byFloor" && (
              <div className="space-y-3">
                {summary.byFloor.map((bd) => <FloorCard key={bd.floor.id} breakdown={bd} />)}
              </div>
            )}

            {/* BY TYPE view */}
            {resultsTab === "byType" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-5">
                <SectionTable section={summary.footings}    title="القواعد"           colorClass="bg-blue-50 border-blue-200 text-blue-800" />
                <SectionTable section={summary.columns}     title="الأعمدة"           colorClass="bg-orange-50 border-orange-200 text-orange-800" />
                <SectionTable section={summary.beams}       title="الكمرات"           colorClass="bg-green-50 border-green-200 text-green-800" />
                <SectionTable section={summary.solidSlabs}  title="البلاطات المصمتة"  colorClass="bg-purple-50 border-purple-200 text-purple-800" />
                <SectionTable section={summary.hollowSlabs} title="البلاطات المجوفة"  colorClass="bg-rose-50 border-rose-200 text-rose-800" />
                <SectionTable section={summary.flatSlabs}   title="البلاطات المسطحة"  colorClass="bg-teal-50 border-teal-200 text-teal-800" />
                <SectionTable section={summary.waffleSlabs} title="بلاطات الواف"      colorClass="bg-amber-50 border-amber-200 text-amber-800" />
              </div>
            )}

            {/* BOQ view */}
            {resultsTab === "boq" && (() => {
              const cp = parseFloat(project.concretePricePerM3) || 0;
              const sp = parseFloat(project.steelPricePerTon)   || 0;
              const boq = computeBOQ(summary, floors,
                [footings, columns, beams, solidSlabs, hollowSlabs, flatSlabs, waffleSlabs],
                cp, sp);
              const TYPE_COLORS: Record<string, string> = {
                F: "bg-blue-50",  C: "bg-orange-50", B: "bg-green-50",
                SS: "bg-purple-50", HS: "bg-rose-50", FS: "bg-teal-50", WS: "bg-amber-50",
              };
              const TYPE_BADGE: Record<string, string> = {
                F: "bg-blue-100 text-blue-700",    C: "bg-orange-100 text-orange-700",
                B: "bg-green-100 text-green-700",  SS: "bg-purple-100 text-purple-700",
                HS: "bg-rose-100 text-rose-700",   FS: "bg-teal-100 text-teal-700",
                WS: "bg-amber-100 text-amber-700",
              };
              return (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  {/* Table header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-700">جدول الكميات (BOQ)</h4>
                    <span className="text-xs text-slate-400">{boq.length} عنصر</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs" style={{ minWidth: "820px" }}>
                      <thead className="bg-slate-800 text-white sticky top-0">
                        <tr>
                          <th className="px-3 py-2.5 text-right font-semibold w-8">#</th>
                          <th className="px-3 py-2.5 text-right font-semibold">النوع</th>
                          <th className="px-3 py-2.5 text-right font-semibold">الطابق</th>
                          <th className="px-3 py-2.5 text-right font-semibold">الرمز</th>
                          <th className="px-3 py-2.5 text-center font-semibold">الأبعاد (م)</th>
                          <th className="px-3 py-2.5 text-center font-semibold">العدد</th>
                          <th className="px-3 py-2.5 text-center font-semibold">حجم/وحدة (م³)</th>
                          <th className="px-3 py-2.5 text-center font-semibold">إجمالي الحجم (م³)</th>
                          <th className="px-3 py-2.5 text-center font-semibold">الحديد (كجم)</th>
                          <th className="px-3 py-2.5 text-center font-semibold">التكلفة الإجمالية</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {boq.map((item) => (
                          <tr key={item.no} className={`${TYPE_COLORS[item.typeCode] ?? "bg-white"} hover:brightness-95 transition-all`}>
                            <td className="px-3 py-2 text-slate-400 font-mono">{item.no}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_BADGE[item.typeCode] ?? ""}`}>
                                {item.typeLabel}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-600">{item.floorName}</td>
                            <td className="px-3 py-2 font-semibold text-slate-700">{item.label}</td>
                            <td className="px-3 py-2 text-center text-slate-600 font-mono">
                              {item.dim1.toFixed(2)} × {item.dim2.toFixed(2)} × {item.dim3.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-center font-bold text-slate-700">{item.qty}</td>
                            <td className="px-3 py-2 text-center text-slate-600">{fmt(item.volEach, 3)}</td>
                            <td className="px-3 py-2 text-center font-semibold text-slate-700">{fmt(item.volTotal, 3)}</td>
                            <td className="px-3 py-2 text-center text-slate-600">{fmt(item.steelKgTotal, 1)}</td>
                            <td className="px-3 py-2 text-center font-bold text-slate-800">{fmt(item.costTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-900 text-white">
                        <tr>
                          <td colSpan={7} className="px-3 py-3 font-bold text-right">المجموع الكلي</td>
                          <td className="px-3 py-3 text-center font-bold">{fmt(boq.reduce((s, r) => s + r.volTotal, 0), 3)}</td>
                          <td className="px-3 py-3 text-center font-bold">{fmt(boq.reduce((s, r) => s + r.steelKgTotal, 0), 1)}</td>
                          <td className="px-3 py-3 text-center font-bold">{fmt(boq.reduce((s, r) => s + r.costTotal, 0))}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Grand summary — always visible */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h4 className="text-sm font-bold text-slate-700 mb-3">الملخص الإجمالي للمشروع</h4>

              {/* Per-floor quick table */}
              {summary.byFloor.filter((bd) => bd.totalVolume > 0).length > 1 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-right px-3 py-2 font-semibold text-slate-600">الطابق</th>
                        <th className="text-center px-3 py-2 font-semibold text-slate-600">خرسانة (م³)</th>
                        <th className="text-center px-3 py-2 font-semibold text-slate-600">حديد (طن)</th>
                        <th className="text-center px-3 py-2 font-semibold text-slate-600">التكلفة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.byFloor.filter((bd) => bd.totalVolume > 0).map((bd, i) => (
                        <tr key={bd.floor.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="px-3 py-2 font-medium text-slate-700">{bd.floor.name}</td>
                          <td className="px-3 py-2 text-center text-slate-600">{fmt(bd.totalVolume)}</td>
                          <td className="px-3 py-2 text-center text-slate-600">{fmt(bd.totalSteelTons, 3)}</td>
                          <td className="px-3 py-2 text-center text-slate-600">{fmt(bd.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-800 text-white">
                      <tr>
                        <td className="px-3 py-2.5 font-bold">الإجمالي</td>
                        <td className="px-3 py-2.5 text-center font-bold">{fmt(summary.totalConcreteVolume)}</td>
                        <td className="px-3 py-2.5 text-center font-bold">{fmt(summary.totalSteelTons, 3)}</td>
                        <td className="px-3 py-2.5 text-center font-bold">{fmt(summary.grandTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Cost cards */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-600 font-medium mb-1">تكلفة الخرسانة</p>
                  <p className="text-base font-bold text-blue-800">{fmt(summary.totalConcreteCost)}</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-600 font-medium mb-1">تكلفة الحديد</p>
                  <p className="text-base font-bold text-slate-800">{fmt(summary.totalSteelCost)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-600 font-medium mb-1">الإجمالي الكلي</p>
                  <p className="text-base font-bold text-green-800">{fmt(summary.grandTotal)}</p>
                </div>
              </div>

              {/* Steel totals */}
              <div className="bg-slate-800 rounded-xl p-4 text-white flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">إجمالي الحديد</p>
                  <p className="text-2xl font-bold">{fmt(summary.totalSteelTons, 3)} <span className="text-sm font-normal text-slate-300">طن</span></p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400">بالكيلوجرام</p>
                  <p className="text-lg font-semibold text-slate-200">{fmt(summary.totalSteelKg, 1)} كجم</p>
                </div>
              </div>
            </div>

            {/* Mix Design Results */}
            {(() => {
              const mr = computeMix(summary.totalConcreteVolume, mix);
              const ratioLabel = `${mix.cement}:${mix.sand}:${mix.gravel}`;
              return (
                <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-5">
                  <h4 className="text-sm font-bold text-orange-700 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    مواد الخلطة الخرسانية — نسبة {ratioLabel}
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    لإجمالي {fmt(summary.totalConcreteVolume)} م³ خرسانة • الحجم الجاف المطلوب: {fmt(mr.dryVolume)} م³
                  </p>

                  {/* Big 3 cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
                      <div className="text-3xl mb-1">🟫</div>
                      <p className="text-xs font-semibold text-orange-600 mb-1">أكياس أسمنت</p>
                      <p className="text-3xl font-black text-orange-800">{fmt(mr.cementBags, 0)}</p>
                      <p className="text-xs text-orange-500 mt-1">كيس {mix.bagWeightKg} كجم</p>
                      <p className="text-xs text-slate-400 mt-0.5">{fmt(mr.cementVolume)} م³</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
                      <div className="text-3xl mb-1">🟨</div>
                      <p className="text-xs font-semibold text-yellow-700 mb-1">حجم الرمل</p>
                      <p className="text-3xl font-black text-yellow-800">{fmt(mr.sandVolume)}</p>
                      <p className="text-xs text-yellow-600 mt-1">م³</p>
                      <p className="text-xs text-slate-400 mt-0.5">{fmt(mr.sandVolume * 1.6, 1)} طن تقريباً</p>
                    </div>
                    <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 text-center">
                      <div className="text-3xl mb-1">⬛</div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">حجم الزلط</p>
                      <p className="text-3xl font-black text-slate-800">{fmt(mr.gravelVolume)}</p>
                      <p className="text-xs text-slate-500 mt-1">م³</p>
                      <p className="text-xs text-slate-400 mt-0.5">{fmt(mr.gravelVolume * 1.55, 1)} طن تقريباً</p>
                    </div>
                  </div>

                  {/* Per-m³ reference row */}
                  <div className="bg-orange-50/70 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-orange-700 mb-2">للمرجع — كميات لكل م³ خرسانة:</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {(() => {
                        const per = computeMix(1, mix);
                        return [
                          { icon: "🟫", label: "كيس أسمنت", val: `${fmt(per.cementBags, 0)} كيس` },
                          { icon: "🟨", label: "رمل",        val: `${fmt(per.sandVolume)} م³` },
                          { icon: "⬛", label: "زلط",        val: `${fmt(per.gravelVolume)} م³` },
                        ].map((item) => (
                          <div key={item.label}>
                            <p className="text-xs text-slate-500">{item.icon} {item.label}</p>
                            <p className="text-sm font-bold text-slate-700">{item.val}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
