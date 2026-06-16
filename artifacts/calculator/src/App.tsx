import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type TabId = "footings" | "columns" | "beams" | "slabs";

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
  footingSteelRatio: string;
  columnSteelRatio: string;
  beamSteelRatio: string;
  slabSteelRatio: string;
  steelPricePerTon: string;
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
  slabs: SectionSummary;
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
  footingSteelRatio: "80",
  columnSteelRatio: "120",
  beamSteelRatio: "150",
  slabSteelRatio: "90",
  steelPricePerTon: "",
};

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

function computeSection(elements: ElementType[], ratio: number, concretePrice: number, steelPricePerTon: number): SectionSummary {
  const results: ElementResult[] = elements.filter(isElementValid).map((e) => {
    const d1 = parseFloat(e.dim1);
    const d2 = parseFloat(e.dim2);
    const d3 = parseFloat(e.dim3);
    const q = parseInt(e.quantity);
    const volumeEach = d1 * d2 * d3;
    const totalVolume = volumeEach * q;
    const steelKg = totalVolume * ratio;
    return { id: e.id, label: e.label || `عنصر`, dim1: d1, dim2: d2, dim3: d3, quantity: q, volumeEach, totalVolume, steelKg };
  });

  const totalVolume = results.reduce((s, r) => s + r.totalVolume, 0);
  const totalSteelKg = results.reduce((s, r) => s + r.steelKg, 0);
  const totalSteelTons = totalSteelKg / 1000;
  const concreteCost = totalVolume * concretePrice;
  const steelCost = totalSteelTons * steelPricePerTon;
  return { elements: results, totalVolume, totalSteelKg, totalSteelTons, concreteCost, steelCost, total: concreteCost + steelCost };
}

function computeFull(footings: ElementType[], columns: ElementType[], beams: ElementType[], slabs: ElementType[], p: ProjectInfo): FullSummary {
  const cp = parseFloat(p.concretePricePerM3);
  const sp = parseFloat(p.steelPricePerTon);
  const f = computeSection(footings, parseFloat(p.footingSteelRatio || "80"), cp, sp);
  const c = computeSection(columns, parseFloat(p.columnSteelRatio || "120"), cp, sp);
  const b = computeSection(beams, parseFloat(p.beamSteelRatio || "150"), cp, sp);
  const s = computeSection(slabs, parseFloat(p.slabSteelRatio || "90"), cp, sp);
  return {
    footings: f, columns: c, beams: b, slabs: s,
    totalConcreteVolume: f.totalVolume + c.totalVolume + b.totalVolume + s.totalVolume,
    totalSteelKg: f.totalSteelKg + c.totalSteelKg + b.totalSteelKg + s.totalSteelKg,
    totalSteelTons: f.totalSteelTons + c.totalSteelTons + b.totalSteelTons + s.totalSteelTons,
    totalConcreteCost: f.concreteCost + c.concreteCost + b.concreteCost + s.concreteCost,
    totalSteelCost: f.steelCost + c.steelCost + b.steelCost + s.steelCost,
    grandTotal: f.total + c.total + b.total + s.total,
  };
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("ar-EG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const TABS: { id: TabId; label: string; icon: string; dim1Label: string; dim2Label: string; dim3Label: string; defaultLabel: string }[] = [
  { id: "footings", label: "القواعد",  icon: "🟦", dim1Label: "الطول (م)", dim2Label: "العرض (م)",  dim3Label: "السمك (م)",      defaultLabel: "F" },
  { id: "columns",  label: "الأعمدة", icon: "🟧", dim1Label: "العرض (م)", dim2Label: "العمق (م)",  dim3Label: "الارتفاع (م)", defaultLabel: "C" },
  { id: "beams",    label: "الكمرات", icon: "🟩", dim1Label: "العرض (م)", dim2Label: "العمق (م)",  dim3Label: "الطول (م)",      defaultLabel: "B" },
  { id: "slabs",    label: "البلاطات",icon: "🟪", dim1Label: "الطول (م)", dim2Label: "العرض (م)",  dim3Label: "السمك (م)",      defaultLabel: "S" },
];

function ElementCard({ element, idx, config, tabCount, onChange, onRemove }: {
  element: ElementType; idx: number; config: typeof TABS[0]; tabCount: number;
  onChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
          {config.label.slice(0, -1)} {idx + 1}
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
            placeholder={`مثال: ${config.defaultLabel}${idx + 1}`}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: "dim1", label: config.dim1Label },
            { name: "dim2", label: config.dim2Label },
            { name: "dim3", label: config.dim3Label },
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

function SectionTable({ section, title, dimLabels }: {
  section: SectionSummary; title: string;
  dimLabels: [string, string, string];
}) {
  if (section.elements.length === 0) return null;
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
          <tfoot className="bg-blue-50 border-t-2 border-blue-200">
            <tr>
              <td colSpan={3} className="px-3 py-2 font-bold text-blue-800 text-right">إجمالي {title}</td>
              <td className="px-2 py-2 text-center font-bold text-blue-800">{fmt(section.totalVolume)}</td>
              <td className="px-2 py-2 text-center font-bold text-blue-800">{fmt(section.totalSteelKg, 1)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("footings");
  const [project, setProject] = useState<ProjectInfo>(initialProject);
  const [footings, setFootings] = useState<ElementType[]>([newElement()]);
  const [columns, setColumns] = useState<ElementType[]>([newElement()]);
  const [beams, setBeams] = useState<ElementType[]>([newElement()]);
  const [slabs, setSlabs] = useState<ElementType[]>([newElement()]);
  const [summary, setSummary] = useState<FullSummary | null>(null);
  const [exporting, setExporting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const stateMap: Record<TabId, [ElementType[], React.Dispatch<React.SetStateAction<ElementType[]>>]> = {
    footings: [footings, setFootings],
    columns: [columns, setColumns],
    beams: [beams, setBeams],
    slabs: [slabs, setSlabs],
  };

  function handleProjectChange(e: React.ChangeEvent<HTMLInputElement>) {
    setProject((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSummary(null);
  }

  function handleElementChange(tab: TabId, id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const [, setter] = stateMap[tab];
    setter((es) => es.map((el) => el.id === id ? { ...el, [e.target.name]: e.target.value } : el));
    setSummary(null);
  }

  function addElement(tab: TabId) {
    const [, setter] = stateMap[tab];
    setter((es) => [...es, newElement()]);
  }

  function removeElement(tab: TabId, id: string) {
    const [elements, setter] = stateMap[tab];
    if (elements.length === 1) return;
    setter((es) => es.filter((e) => e.id !== id));
    setSummary(null);
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const hasData = [...footings, ...columns, ...beams, ...slabs].some(isElementValid);
    if (hasData && isPricesValid(project)) {
      setSummary(computeFull(footings, columns, beams, slabs, project));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }

  function handleReset() {
    setProject(initialProject);
    setFootings([newElement()]);
    setColumns([newElement()]);
    setBeams([newElement()]);
    setSlabs([newElement()]);
    setSummary(null);
    setActiveTab("footings");
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

  const canCalculate = [...footings, ...columns, ...beams, ...slabs].some(isElementValid) && isPricesValid(project);
  const tabConfig = TABS.find((t) => t.id === activeTab)!;
  const [activeElements] = stateMap[activeTab];

  const sectionHasData = (tab: TabId) => stateMap[tab][0].some(isElementValid);

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
          <p className="text-slate-500 mt-1 text-sm">قواعد • أعمدة • كمرات</p>
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
            <div className="grid grid-cols-2 gap-3 mb-3">
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
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">حديد القواعد (كجم/م³)</label>
                <input type="number" name="footingSteelRatio" value={project.footingSteelRatio} onChange={handleProjectChange}
                  placeholder="80" min="1" step="1"
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">حديد الأعمدة (كجم/م³)</label>
                <input type="number" name="columnSteelRatio" value={project.columnSteelRatio} onChange={handleProjectChange}
                  placeholder="120" min="1" step="1"
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">حديد الكمرات (كجم/م³)</label>
                <input type="number" name="beamSteelRatio" value={project.beamSteelRatio} onChange={handleProjectChange}
                  placeholder="150" min="1" step="1"
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">حديد البلاطات (كجم/م³)</label>
                <input type="number" name="slabSteelRatio" value={project.slabSteelRatio} onChange={handleProjectChange}
                  placeholder="90" min="1" step="1"
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center" />
              </div>
            </div>
          </div>

          {/* Tab Nav */}
          <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
            {TABS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}>
                {sectionHasData(tab.id) && activeTab !== tab.id && (
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Elements */}
          <div className="space-y-3">
            {activeElements.map((el, idx) => (
              <ElementCard key={el.id} element={el} idx={idx} config={tabConfig} tabCount={activeElements.length}
                onChange={(id, e) => handleElementChange(activeTab, id, e)}
                onRemove={(id) => removeElement(activeTab, id)} />
            ))}
          </div>

          <button type="button" onClick={() => addElement(activeTab)}
            className="w-full py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-500 hover:text-blue-700 font-medium rounded-2xl transition flex items-center justify-center gap-2 bg-blue-50/50 hover:bg-blue-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة {tabConfig.label.slice(0, -1)} أخرى
          </button>

          <div className="flex gap-3">
            <button type="submit" disabled={!canCalculate}
              className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg disabled:shadow-none">
              احسب الكميات الإجمالية للمشروع
            </button>
            <button type="button" onClick={handleReset}
              className="py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition">
              مسح الكل
            </button>
          </div>
        </form>

        {/* Results */}
        {summary && (
          <div className="mt-4 bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">ملخص الكميات والتكاليف</h2>
              <button onClick={handleExportPDF} disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm">
                {exporting ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>جاري التصدير...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>تصدير PDF</>
                )}
              </button>
            </div>

            <div ref={resultsRef} className="bg-white rounded-xl p-5 space-y-5">
              {/* Report Header */}
              <div className="text-center border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-800 text-base">{project.projectName || "تقرير الكميات الإنشائية"}</h3>
                <p className="text-slate-400 text-xs mt-1">
                  {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                {(project.engineerName || project.clientName) && (
                  <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                    {project.engineerName && <span><span className="text-slate-400">المهندس: </span><span className="font-semibold text-slate-700">{project.engineerName}</span></span>}
                    {project.clientName && <span><span className="text-slate-400">العميل: </span><span className="font-semibold text-slate-700">{project.clientName}</span></span>}
                  </div>
                )}
              </div>

              {/* Section Tables */}
              <SectionTable section={summary.footings} title="القواعد" dimLabels={["الطول", "العرض", "السمك"]} />
              <SectionTable section={summary.columns} title="الأعمدة" dimLabels={["العرض", "العمق", "الارتفاع"]} />
              <SectionTable section={summary.beams} title="الكمرات" dimLabels={["العرض", "العمق", "الطول"]} />

              {/* Totals by section */}
              {(summary.footings.elements.length + summary.columns.elements.length + summary.beams.elements.length) > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">ملخص إجمالي حسب العنصر</h4>
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-right px-3 py-2 font-semibold text-slate-600">العنصر</th>
                          <th className="text-center px-2 py-2 font-semibold text-slate-600">الخرسانة (م³)</th>
                          <th className="text-center px-2 py-2 font-semibold text-slate-600">الحديد (طن)</th>
                          <th className="text-center px-2 py-2 font-semibold text-slate-600">التكلفة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {summary.footings.elements.length > 0 && (
                          <tr className="bg-blue-50/40">
                            <td className="px-3 py-2 font-medium text-slate-700">القواعد</td>
                            <td className="px-2 py-2 text-center text-slate-700">{fmt(summary.footings.totalVolume)}</td>
                            <td className="px-2 py-2 text-center text-slate-700">{fmt(summary.footings.totalSteelTons, 3)}</td>
                            <td className="px-2 py-2 text-center font-semibold text-slate-800">{fmt(summary.footings.total)}</td>
                          </tr>
                        )}
                        {summary.columns.elements.length > 0 && (
                          <tr className="bg-orange-50/40">
                            <td className="px-3 py-2 font-medium text-slate-700">الأعمدة</td>
                            <td className="px-2 py-2 text-center text-slate-700">{fmt(summary.columns.totalVolume)}</td>
                            <td className="px-2 py-2 text-center text-slate-700">{fmt(summary.columns.totalSteelTons, 3)}</td>
                            <td className="px-2 py-2 text-center font-semibold text-slate-800">{fmt(summary.columns.total)}</td>
                          </tr>
                        )}
                        {summary.beams.elements.length > 0 && (
                          <tr className="bg-green-50/40">
                            <td className="px-3 py-2 font-medium text-slate-700">الكمرات</td>
                            <td className="px-2 py-2 text-center text-slate-700">{fmt(summary.beams.totalVolume)}</td>
                            <td className="px-2 py-2 text-center text-slate-700">{fmt(summary.beams.totalSteelTons, 3)}</td>
                            <td className="px-2 py-2 text-center font-semibold text-slate-800">{fmt(summary.beams.total)}</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="border-t-2 border-slate-300 bg-slate-100">
                        <tr>
                          <td className="px-3 py-2 font-bold text-slate-800 text-right">الإجمالي الكلي</td>
                          <td className="px-2 py-2 text-center font-bold text-blue-800">{fmt(summary.totalConcreteVolume)}</td>
                          <td className="px-2 py-2 text-center font-bold text-blue-800">{fmt(summary.totalSteelTons, 3)}</td>
                          <td className="px-2 py-2 text-center font-bold text-blue-800">{fmt(summary.grandTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Big summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-600 rounded-xl p-4 text-white">
                  <p className="text-blue-100 text-xs mb-1">إجمالي حجم الخرسانة</p>
                  <p className="text-2xl font-bold">{fmt(summary.totalConcreteVolume)}</p>
                  <p className="text-blue-200 text-xs">متر مكعب</p>
                </div>
                <div className="bg-slate-700 rounded-xl p-4 text-white">
                  <p className="text-slate-300 text-xs mb-1">إجمالي وزن الحديد</p>
                  <p className="text-2xl font-bold">{fmt(summary.totalSteelTons, 3)}</p>
                  <p className="text-slate-400 text-xs">طن ({fmt(summary.totalSteelKg, 0)} كجم)</p>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm text-slate-600">تكلفة الخرسانة التقديرية</span>
                  <span className="font-semibold text-slate-800">{fmt(summary.totalConcreteCost)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm text-slate-600">تكلفة الحديد التقديرية</span>
                  <span className="font-semibold text-slate-800">{fmt(summary.totalSteelCost)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-amber-50">
                  <span className="text-sm font-bold text-amber-800">إجمالي تكلفة المواد للهيكل</span>
                  <span className="text-xl font-bold text-amber-700">{fmt(summary.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
