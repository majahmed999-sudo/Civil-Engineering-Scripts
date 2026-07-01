import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type TabId = "footings" | "columns" | "beams" | "slabs";
type SlabSubType = "solid" | "hollow" | "flat" | "waffle";

interface ElementType {
  id: string;
  label: string;
  dim1: string;
  dim2: string;
  dim3: string;
  quantity: string;
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

interface FullSummary {
  footings: SectionSummary;
  columns: SectionSummary;
  beams: SectionSummary;
  solidSlabs: SectionSummary;
  hollowSlabs: SectionSummary;
  flatSlabs: SectionSummary;
  waffleSlabs: SectionSummary;
  totalConcreteVolume: number;
  totalSteelKg: number;
  totalSteelTons: number;
  totalConcreteCost: number;
  totalSteelCost: number;
  grandTotal: number;
}

const newElement = (): ElementType => ({
  id: crypto.randomUUID(),
  label: "",
  dim1: "",
  dim2: "",
  dim3: "",
  quantity: "1",
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
  {
    id: "solid",
    label: "بلاطة مصمتة",
    shortLabel: "مصمتة",
    color: "purple",
    activeBg: "bg-purple-600",
    steelRatioKey: "solidSlabSteelRatio",
    defaultLabel: "SS",
    note: "حجم الخرسانة = الطول × العرض × السمك",
  },
  {
    id: "hollow",
    label: "بلاطة مجوفة (هولوكور)",
    shortLabel: "مجوفة",
    color: "rose",
    activeBg: "bg-rose-600",
    steelRatioKey: "hollowSlabSteelRatio",
    concreteRatioKey: "hollowConcreteRatio",
    defaultLabel: "HS",
    note: "حجم الخرسانة الفعلي = الطول × العرض × السمك × نسبة الخرسانة",
  },
  {
    id: "flat",
    label: "بلاطة مسطحة",
    shortLabel: "مسطحة",
    color: "teal",
    activeBg: "bg-teal-600",
    steelRatioKey: "flatSlabSteelRatio",
    defaultLabel: "FS",
    note: "حجم الخرسانة = الطول × العرض × السمك",
  },
  {
    id: "waffle",
    label: "بلاطة واف",
    shortLabel: "واف",
    color: "amber",
    activeBg: "bg-amber-600",
    steelRatioKey: "waffleSlabSteelRatio",
    concreteRatioKey: "waffleConcreteRatio",
    defaultLabel: "WS",
    note: "حجم الخرسانة الفعلي = الطول × العرض × السمك × نسبة الخرسانة",
  },
];

function isElementValid(e: ElementType) {
  return (
    parseFloat(e.dim1) > 0 &&
    parseFloat(e.dim2) > 0 &&
    parseFloat(e.dim3) > 0 &&
    parseInt(e.quantity) > 0
  );
}

function isPricesValid(p: ProjectInfo) {
  return parseFloat(p.concretePricePerM3) > 0 && parseFloat(p.steelPricePerTon) > 0;
}

function computeSection(
  elements: ElementType[],
  ratio: number,
  concretePrice: number,
  steelPricePerTon: number,
  concreteEfficiency = 1.0
): SectionSummary {
  const results: ElementResult[] = elements.filter(isElementValid).map((e) => {
    const d1 = parseFloat(e.dim1);
    const d2 = parseFloat(e.dim2);
    const d3 = parseFloat(e.dim3);
    const q = parseInt(e.quantity);
    const volumeEach = d1 * d2 * d3 * concreteEfficiency;
    const totalVolume = volumeEach * q;
    const steelKg = totalVolume * ratio;
    return { id: e.id, label: e.label || "عنصر", dim1: d1, dim2: d2, dim3: d3, quantity: q, volumeEach, totalVolume, steelKg };
  });
  const totalVolume = results.reduce((s, r) => s + r.totalVolume, 0);
  const totalSteelKg = results.reduce((s, r) => s + r.steelKg, 0);
  const totalSteelTons = totalSteelKg / 1000;
  const concreteCost = totalVolume * concretePrice;
  const steelCost = totalSteelTons * steelPricePerTon;
  return { elements: results, totalVolume, totalSteelKg, totalSteelTons, concreteCost, steelCost, total: concreteCost + steelCost };
}

function computeFull(
  footings: ElementType[],
  columns: ElementType[],
  beams: ElementType[],
  solidSlabs: ElementType[],
  hollowSlabs: ElementType[],
  flatSlabs: ElementType[],
  waffleSlabs: ElementType[],
  p: ProjectInfo
): FullSummary {
  const cp = parseFloat(p.concretePricePerM3);
  const sp = parseFloat(p.steelPricePerTon);
  const f  = computeSection(footings,    parseFloat(p.footingSteelRatio  || "80"),  cp, sp);
  const c  = computeSection(columns,     parseFloat(p.columnSteelRatio   || "120"), cp, sp);
  const b  = computeSection(beams,       parseFloat(p.beamSteelRatio     || "150"), cp, sp);
  const ss = computeSection(solidSlabs,  parseFloat(p.solidSlabSteelRatio || "90"), cp, sp);
  const hs = computeSection(hollowSlabs, parseFloat(p.hollowSlabSteelRatio || "50"), cp, sp, parseFloat(p.hollowConcreteRatio || "0.55"));
  const fs = computeSection(flatSlabs,   parseFloat(p.flatSlabSteelRatio  || "110"), cp, sp);
  const ws = computeSection(waffleSlabs, parseFloat(p.waffleSlabSteelRatio || "85"), cp, sp, parseFloat(p.waffleConcreteRatio || "0.65"));

  const all = [f, c, b, ss, hs, fs, ws];
  return {
    footings: f, columns: c, beams: b,
    solidSlabs: ss, hollowSlabs: hs, flatSlabs: fs, waffleSlabs: ws,
    totalConcreteVolume: all.reduce((s, x) => s + x.totalVolume, 0),
    totalSteelKg:        all.reduce((s, x) => s + x.totalSteelKg, 0),
    totalSteelTons:      all.reduce((s, x) => s + x.totalSteelTons, 0),
    totalConcreteCost:   all.reduce((s, x) => s + x.concreteCost, 0),
    totalSteelCost:      all.reduce((s, x) => s + x.steelCost, 0),
    grandTotal:          all.reduce((s, x) => s + x.total, 0),
  };
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("ar-EG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const MAIN_TABS: { id: TabId; label: string; icon: string; dim1Label: string; dim2Label: string; dim3Label: string; defaultLabel: string }[] = [
  { id: "footings", label: "القواعد",  icon: "🟦", dim1Label: "الطول (م)", dim2Label: "العرض (م)",  dim3Label: "السمك (م)",      defaultLabel: "F" },
  { id: "columns",  label: "الأعمدة", icon: "🟧", dim1Label: "العرض (م)", dim2Label: "العمق (م)",  dim3Label: "الارتفاع (م)",   defaultLabel: "C" },
  { id: "beams",    label: "الكمرات", icon: "🟩", dim1Label: "العرض (م)", dim2Label: "العمق (م)",  dim3Label: "الطول (م)",       defaultLabel: "B" },
  { id: "slabs",    label: "البلاطات",icon: "🟪", dim1Label: "الطول (م)", dim2Label: "العرض (م)",  dim3Label: "السمك (م)",       defaultLabel: "S" },
];

function ElementCard({ element, idx, dim1Label, dim2Label, dim3Label, defaultLabel, tabCount, onChange, onRemove, accentColor }: {
  element: ElementType; idx: number;
  dim1Label: string; dim2Label: string; dim3Label: string; defaultLabel: string;
  tabCount: number; accentColor?: string;
  onChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
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
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">المسمى / الرمز <span className="text-slate-400">(اختياري)</span></label>
          <input type="text" name="label" value={element.label} onChange={(e) => onChange(element.id, e)}
            placeholder={`مثال: ${defaultLabel}${idx + 1}`}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("footings");
  const [slabSubTab, setSlabSubTab] = useState<SlabSubType>("solid");
  const [project, setProject] = useState<ProjectInfo>(initialProject);

  const [footings,    setFootings]    = useState<ElementType[]>([newElement()]);
  const [columns,     setColumns]     = useState<ElementType[]>([newElement()]);
  const [beams,       setBeams]       = useState<ElementType[]>([newElement()]);
  const [solidSlabs,  setSolidSlabs]  = useState<ElementType[]>([newElement()]);
  const [hollowSlabs, setHollowSlabs] = useState<ElementType[]>([newElement()]);
  const [flatSlabs,   setFlatSlabs]   = useState<ElementType[]>([newElement()]);
  const [waffleSlabs, setWaffleSlabs] = useState<ElementType[]>([newElement()]);

  const [summary, setSummary] = useState<FullSummary | null>(null);
  const [exporting, setExporting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  function handleProjectChange(e: React.ChangeEvent<HTMLInputElement>) {
    setProject((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSummary(null);
  }

  function handleElementChange(elements: ElementType[], setter: React.Dispatch<React.SetStateAction<ElementType[]>>, id: string, e: React.ChangeEvent<HTMLInputElement>) {
    void elements;
    setter((es) => es.map((el) => el.id === id ? { ...el, [e.target.name]: e.target.value } : el));
    setSummary(null);
  }

  function addElement(setter: React.Dispatch<React.SetStateAction<ElementType[]>>) {
    setter((es) => [...es, newElement()]);
  }

  function removeElement(elements: ElementType[], setter: React.Dispatch<React.SetStateAction<ElementType[]>>, id: string) {
    if (elements.length === 1) return;
    setter((es) => es.filter((e) => e.id !== id));
    setSummary(null);
  }

  const allElements = [...footings, ...columns, ...beams, ...solidSlabs, ...hollowSlabs, ...flatSlabs, ...waffleSlabs];

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (allElements.some(isElementValid) && isPricesValid(project)) {
      setSummary(computeFull(footings, columns, beams, solidSlabs, hollowSlabs, flatSlabs, waffleSlabs, project));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }

  function handleReset() {
    setProject(initialProject);
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
      const canvas = await html2canvas(resultsRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 32, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.text(project.projectName || "Structural Quantity Report", pageWidth / 2, 13, { align: "center" });
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Foundations • Columns • Beams • Slabs — Structural Calculator", pageWidth / 2, 22, { align: "center" });

      const dateStr = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(dateStr, pageWidth - margin, 41, { align: "right" });
      if (project.engineerName || project.clientName) {
        pdf.setTextColor(51, 65, 85);
        pdf.setFontSize(8);
        if (project.engineerName) pdf.text(`Engineer: ${project.engineerName}`, margin, 41);
        if (project.clientName) pdf.text(`Client: ${project.clientName}`, project.engineerName ? pageWidth / 2 : margin, 41);
      }

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.line(margin, 45, pageWidth - margin, 45);

      const availHeight = pageHeight - 50 - margin;
      if (imgHeight <= availHeight) {
        pdf.addImage(imgData, "PNG", margin, 50, contentWidth, imgHeight);
      } else {
        const scale = availHeight / imgHeight;
        pdf.addImage(imgData, "PNG", margin, 50, contentWidth * scale, availHeight);
      }

      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text("Generated by Structural Quantity Calculator", pageWidth / 2, pageHeight - 5, { align: "center" });
      pdf.save(`structural-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  const canCalculate = allElements.some(isElementValid) && isPricesValid(project);

  const activeSlabConfig = SLAB_SUBTYPES.find((s) => s.id === slabSubTab)!;
  const [activeSlabElements, activeSlabSetter] = slabStateMap[slabSubTab];

  const sectionHasData = (tab: TabId) => {
    if (tab === "slabs") return [...solidSlabs, ...hollowSlabs, ...flatSlabs, ...waffleSlabs].some(isElementValid);
    return mainStateMap[tab as Exclude<TabId, "slabs">][0].some(isElementValid);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl py-8">

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
                    placeholder="م. أحمد الشمري"
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

          {/* Prices & Ratios */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              أسعار المواد ومعدلات الحديد
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">سعر م³ الخرسانة</label>
                <input type="number" name="concretePricePerM3" value={project.concretePricePerM3} onChange={handleProjectChange}
                  placeholder="0.00" min="0.01" step="0.01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">سعر طن الحديد</label>
                <input type="number" name="steelPricePerTon" value={project.steelPricePerTon} onChange={handleProjectChange}
                  placeholder="0.00" min="0.01" step="0.01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
              </div>
            </div>

            {/* Steel ratios - structural elements */}
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">معدلات حديد العناصر الإنشائية (كجم/م³)</p>
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl mb-3">
              {[
                { name: "footingSteelRatio",  label: "القواعد",  placeholder: "80"  },
                { name: "columnSteelRatio",   label: "الأعمدة", placeholder: "120" },
                { name: "beamSteelRatio",     label: "الكمرات", placeholder: "150" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                  <input type="number" name={f.name} value={project[f.name as keyof ProjectInfo]} onChange={handleProjectChange}
                    placeholder={f.placeholder} min="1" step="1"
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
                </div>
              ))}
            </div>

            {/* Steel ratios - slab types */}
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">معدلات حديد البلاطات (كجم/م³)</p>
            <div className="p-3 bg-purple-50/60 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "solidSlabSteelRatio",  label: "🔵 بلاطة مصمتة",        placeholder: "90"  },
                  { name: "hollowSlabSteelRatio",  label: "🔴 بلاطة مجوفة",        placeholder: "50"  },
                  { name: "flatSlabSteelRatio",    label: "🟢 بلاطة مسطحة",        placeholder: "110" },
                  { name: "waffleSlabSteelRatio",  label: "🟡 بلاطة واف",          placeholder: "85"  },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                    <input type="number" name={f.name} value={project[f.name as keyof ProjectInfo]} onChange={handleProjectChange}
                      placeholder={f.placeholder} min="1" step="1"
                      className="w-full px-2 py-2 border border-purple-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition text-center" />
                  </div>
                ))}
              </div>
              {/* Concrete efficiency for hollow + waffle */}
              <div className="border-t border-purple-200 pt-3">
                <p className="text-xs font-medium text-slate-500 mb-2">نسبة الخرسانة الفعلية (تُحسب للمجوفة والواف فقط)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">🔴 مجوفة — نسبة الخرسانة</label>
                    <input type="number" name="hollowConcreteRatio" value={project.hollowConcreteRatio} onChange={handleProjectChange}
                      placeholder="0.55" min="0.1" max="1" step="0.01"
                      className="w-full px-2 py-2 border border-purple-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition text-center" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">🟡 واف — نسبة الخرسانة</label>
                    <input type="number" name="waffleConcreteRatio" value={project.waffleConcreteRatio} onChange={handleProjectChange}
                      placeholder="0.65" min="0.1" max="1" step="0.01"
                      className="w-full px-2 py-2 border border-purple-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition text-center" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">مثال: 0.55 تعني 55% من الحجم الكلي خرسانة صلبة (القيمة بين 0.1 و 1)</p>
              </div>
            </div>
          </div>

          {/* Tab Nav */}
          <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
            {MAIN_TABS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
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
                    defaultLabel={tabCfg.defaultLabel} tabCount={elements.length}
                    onChange={(id, e) => handleElementChange(elements, setter, id, e)}
                    onRemove={(id) => removeElement(elements, setter, id)} />
                ))}
                <button type="button" onClick={() => addElement(setter)}
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
              {/* Slab type header */}
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
                  <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                    ℹ️ {activeSlabConfig.note}
                  </p>
                )}
              </div>

              {/* Elements for active slab sub-type */}
              {activeSlabElements.map((el, idx) => (
                <ElementCard key={el.id} element={el} idx={idx}
                  dim1Label="الطول (م)" dim2Label="العرض (م)" dim3Label="السمك (م)"
                  defaultLabel={activeSlabConfig.defaultLabel}
                  tabCount={activeSlabElements.length}
                  accentColor={activeSlabConfig.color}
                  onChange={(id, e) => handleElementChange(activeSlabElements, activeSlabSetter, id, e)}
                  onRemove={(id) => removeElement(activeSlabElements, activeSlabSetter, id)} />
              ))}

              <button type="button" onClick={() => addElement(activeSlabSetter)}
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

            {/* Detailed tables */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-5">
              <SectionTable section={summary.footings}    title="القواعد"           colorClass="bg-blue-50 border-blue-200 text-blue-800" />
              <SectionTable section={summary.columns}     title="الأعمدة"           colorClass="bg-orange-50 border-orange-200 text-orange-800" />
              <SectionTable section={summary.beams}       title="الكمرات"           colorClass="bg-green-50 border-green-200 text-green-800" />
              <SectionTable section={summary.solidSlabs}  title="البلاطات المصمتة"  colorClass="bg-purple-50 border-purple-200 text-purple-800" />
              <SectionTable section={summary.hollowSlabs} title="البلاطات المجوفة"  colorClass="bg-rose-50 border-rose-200 text-rose-800" />
              <SectionTable section={summary.flatSlabs}   title="البلاطات المسطحة"  colorClass="bg-teal-50 border-teal-200 text-teal-800" />
              <SectionTable section={summary.waffleSlabs} title="بلاطات الواف"      colorClass="bg-amber-50 border-amber-200 text-amber-800" />
            </div>

            {/* Grand summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h4 className="text-sm font-bold text-slate-700 mb-3">الملخص الإجمالي</h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-right px-4 py-2.5 font-semibold text-slate-600">القسم</th>
                      <th className="text-center px-3 py-2.5 font-semibold text-slate-600">الحجم (م³)</th>
                      <th className="text-center px-3 py-2.5 font-semibold text-slate-600">الحديد (طن)</th>
                      <th className="text-center px-3 py-2.5 font-semibold text-slate-600">التكلفة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { label: "🟦 القواعد",           sec: summary.footings,    bg: "bg-blue-50/40" },
                      { label: "🟧 الأعمدة",           sec: summary.columns,     bg: "bg-orange-50/40" },
                      { label: "🟩 الكمرات",           sec: summary.beams,       bg: "bg-green-50/40" },
                      { label: "🟣 مصمتة",             sec: summary.solidSlabs,  bg: "bg-purple-50/40" },
                      { label: "🔴 مجوفة",             sec: summary.hollowSlabs, bg: "bg-rose-50/40" },
                      { label: "🟢 مسطحة",             sec: summary.flatSlabs,   bg: "bg-teal-50/40" },
                      { label: "🟡 واف",               sec: summary.waffleSlabs, bg: "bg-amber-50/40" },
                    ].filter((row) => row.sec.elements.length > 0).map((row) => (
                      <tr key={row.label} className={row.bg}>
                        <td className="px-4 py-2.5 font-medium text-slate-700">{row.label}</td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{fmt(row.sec.totalVolume)}</td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{fmt(row.sec.totalSteelTons, 3)}</td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{fmt(row.sec.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-800 text-white">
                    <tr>
                      <td className="px-4 py-3 font-bold">الإجمالي الكلي</td>
                      <td className="px-3 py-3 text-center font-bold">{fmt(summary.totalConcreteVolume)}</td>
                      <td className="px-3 py-3 text-center font-bold">{fmt(summary.totalSteelTons, 3)}</td>
                      <td className="px-3 py-3 text-center font-bold">{fmt(summary.grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Cost cards */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-600 font-medium mb-1">تكلفة الخرسانة</p>
                  <p className="text-base font-bold text-blue-800">{fmt(summary.totalConcreteCost)}</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-600 font-medium mb-1">تكلفة الحديد</p>
                  <p className="text-base font-bold text-slate-800">{fmt(summary.totalSteelCost)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-600 font-medium mb-1">الإجمالي</p>
                  <p className="text-base font-bold text-green-800">{fmt(summary.grandTotal)}</p>
                </div>
              </div>

              {/* Steel weight card */}
              <div className="mt-3 bg-slate-800 rounded-xl p-4 text-white flex justify-between items-center">
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
          </div>
        )}
      </div>
    </div>
  );
}
