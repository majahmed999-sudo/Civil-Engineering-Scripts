import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface FootingType {
  id: string;
  label: string;
  length: string;
  width: string;
  depth: string;
  quantity: string;
}

interface ProjectInfo {
  projectName: string;
  engineerName: string;
  clientName: string;
  concretePricePerM3: string;
  steelRatio: string;
  steelPricePerTon: string;
}

interface FootingResult {
  id: string;
  label: string;
  length: number;
  width: number;
  depth: number;
  quantity: number;
  volumeEach: number;
  totalVolume: number;
  steelKg: number;
}

interface Summary {
  totalConcreteVolume: number;
  totalSteelKg: number;
  totalSteelTons: number;
  totalConcreteCost: number;
  totalSteelCost: number;
  grandTotal: number;
  footings: FootingResult[];
}

const newFooting = (): FootingType => ({
  id: crypto.randomUUID(),
  label: "",
  length: "",
  width: "",
  depth: "",
  quantity: "1",
});

const initialProject: ProjectInfo = {
  projectName: "",
  engineerName: "",
  clientName: "",
  concretePricePerM3: "",
  steelRatio: "80",
  steelPricePerTon: "",
};

function isFootingValid(f: FootingType) {
  return (
    parseFloat(f.length) > 0 &&
    parseFloat(f.width) > 0 &&
    parseFloat(f.depth) > 0 &&
    parseInt(f.quantity) > 0
  );
}

function isProjectValid(p: ProjectInfo) {
  return parseFloat(p.concretePricePerM3) > 0 && parseFloat(p.steelPricePerTon) > 0;
}

function computeSummary(footings: FootingType[], p: ProjectInfo): Summary {
  const concretePricePerM3 = parseFloat(p.concretePricePerM3);
  const steelRatio = parseFloat(p.steelRatio || "80");
  const steelPricePerTon = parseFloat(p.steelPricePerTon);

  const results: FootingResult[] = footings.filter(isFootingValid).map((f) => {
    const l = parseFloat(f.length);
    const w = parseFloat(f.width);
    const d = parseFloat(f.depth);
    const q = parseInt(f.quantity);
    const volumeEach = l * w * d;
    const totalVolume = volumeEach * q;
    const steelKg = totalVolume * steelRatio;
    return { id: f.id, label: f.label || `قاعدة ${footings.indexOf(f) + 1}`, l, w, d, q, length: l, width: w, depth: d, quantity: q, volumeEach, totalVolume, steelKg };
  });

  const totalConcreteVolume = results.reduce((s, r) => s + r.totalVolume, 0);
  const totalSteelKg = results.reduce((s, r) => s + r.steelKg, 0);
  const totalSteelTons = totalSteelKg / 1000;
  const totalConcreteCost = totalConcreteVolume * concretePricePerM3;
  const totalSteelCost = totalSteelTons * steelPricePerTon;
  const grandTotal = totalConcreteCost + totalSteelCost;

  return { totalConcreteVolume, totalSteelKg, totalSteelTons, totalConcreteCost, totalSteelCost, grandTotal, footings: results };
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("ar-EG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function InputField({ label, note, name, value, onChange, placeholder, type = "number", min = "0.01", step = "0.01" }: {
  label: string; note?: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; min?: string; step?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label} {note && <span className="text-slate-400">{note}</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} min={min} step={step}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
      />
    </div>
  );
}

export default function App() {
  const [project, setProject] = useState<ProjectInfo>(initialProject);
  const [footings, setFootings] = useState<FootingType[]>([newFooting()]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [exporting, setExporting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleProjectChange(e: React.ChangeEvent<HTMLInputElement>) {
    setProject((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSummary(null);
  }

  function handleFootingChange(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    setFootings((fs) => fs.map((f) => f.id === id ? { ...f, [e.target.name]: e.target.value } : f));
    setSummary(null);
  }

  function addFooting() {
    setFootings((fs) => [...fs, newFooting()]);
  }

  function removeFooting(id: string) {
    if (footings.length === 1) return;
    setFootings((fs) => fs.filter((f) => f.id !== id));
    setSummary(null);
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const validFootings = footings.filter(isFootingValid);
    if (validFootings.length > 0 && isProjectValid(project)) {
      setSummary(computeSummary(footings, project));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }

  function handleReset() {
    setProject(initialProject);
    setFootings([newFooting()]);
    setSummary(null);
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
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 32, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.text(project.projectName || "Foundation Quantity Report", pageWidth / 2, 13, { align: "center" });
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Concrete & Reinforcement Steel — Multi-Type Foundation Calculator", pageWidth / 2, 22, { align: "center" });

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

      const finalImgHeight = Math.min(imgHeight, pageHeight - 50 - margin);
      pdf.addImage(imgData, "PNG", margin, 50, contentWidth, finalImgHeight);

      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text("Generated by Concrete & Steel Calculator", pageWidth / 2, pageHeight - 6, { align: "center" });

      pdf.save(`foundation-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  const canCalculate = footings.some(isFootingValid) && isProjectValid(project);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">حاسبة كميات القواعد</h1>
          <p className="text-slate-500 mt-1 text-sm">خرسانة وحديد تسليح — أنواع متعددة</p>
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
              <InputField label="اسم المشروع" note="(اختياري)" name="projectName" value={project.projectName}
                onChange={handleProjectChange} placeholder="مثال: مشروع فلل الريان — قواعد الطابق الأرضي" type="text" min="" step="" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="اسم المهندس" note="(اختياري)" name="engineerName" value={project.engineerName}
                  onChange={handleProjectChange} placeholder="م. أحمد الشمري" type="text" min="" step="" />
                <InputField label="اسم العميل" note="(اختياري)" name="clientName" value={project.clientName}
                  onChange={handleProjectChange} placeholder="المقاول / صاحب العمل" type="text" min="" step="" />
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              أسعار المواد (مشتركة لجميع القواعد)
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <InputField label="سعر م³ الخرسانة" name="concretePricePerM3" value={project.concretePricePerM3}
                onChange={handleProjectChange} placeholder="0.00" />
              <InputField label="معدل الحديد (كجم/م³)" note="— افتراضي 80" name="steelRatio" value={project.steelRatio}
                onChange={handleProjectChange} placeholder="80" />
              <InputField label="سعر طن الحديد" name="steelPricePerTon" value={project.steelPricePerTon}
                onChange={handleProjectChange} placeholder="0.00" />
            </div>
          </div>

          {/* Footing Types */}
          <div className="space-y-3">
            {footings.map((f, idx) => (
              <div key={f.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    نوع القاعدة {idx + 1}
                  </h2>
                  {footings.length > 1 && (
                    <button type="button" onClick={() => removeFooting(f.id)}
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
                    <input type="text" name="label" value={f.label}
                      onChange={(e) => handleFootingChange(f.id, e)}
                      placeholder={`مثال: F1 أو قاعدة عمود داخلي`}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">الطول (م)</label>
                      <input type="number" name="length" value={f.length}
                        onChange={(e) => handleFootingChange(f.id, e)}
                        placeholder="0.00" min="0.01" step="0.01"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">العرض (م)</label>
                      <input type="number" name="width" value={f.width}
                        onChange={(e) => handleFootingChange(f.id, e)}
                        placeholder="0.00" min="0.01" step="0.01"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">السمك (م)</label>
                      <input type="number" name="depth" value={f.depth}
                        onChange={(e) => handleFootingChange(f.id, e)}
                        placeholder="0.00" min="0.01" step="0.01"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">العدد</label>
                      <input type="number" name="quantity" value={f.quantity}
                        onChange={(e) => handleFootingChange(f.id, e)}
                        placeholder="1" min="1" step="1"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Footing */}
          <button type="button" onClick={addFooting}
            className="w-full py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-500 hover:text-blue-700 font-medium rounded-2xl transition flex items-center justify-center gap-2 bg-blue-50/50 hover:bg-blue-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة نوع قاعدة آخر
          </button>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={!canCalculate}
              className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg disabled:shadow-none">
              احسب الكميات الإجمالية
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
              <h2 className="text-base font-bold text-slate-800">النتائج الإجمالية</h2>
              <button onClick={handleExportPDF} disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm">
                {exporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    تصدير PDF
                  </>
                )}
              </button>
            </div>

            <div ref={resultsRef} className="bg-white rounded-xl p-5 space-y-4">
              {/* Report Header */}
              <div className="text-center border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-800 text-base">{project.projectName || "تقرير كميات القواعد"}</h3>
                <p className="text-slate-400 text-xs mt-1">
                  {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                {(project.engineerName || project.clientName) && (
                  <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                    {project.engineerName && (
                      <span><span className="text-slate-400">المهندس: </span><span className="font-semibold text-slate-700">{project.engineerName}</span></span>
                    )}
                    {project.clientName && (
                      <span><span className="text-slate-400">العميل: </span><span className="font-semibold text-slate-700">{project.clientName}</span></span>
                    )}
                  </div>
                )}
              </div>

              {/* Per-type table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">تفصيل الأنواع</h4>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-right px-3 py-2 font-semibold text-slate-600">النوع</th>
                        <th className="text-center px-2 py-2 font-semibold text-slate-600">الأبعاد (م)</th>
                        <th className="text-center px-2 py-2 font-semibold text-slate-600">العدد</th>
                        <th className="text-center px-2 py-2 font-semibold text-slate-600">الحجم الكلي (م³)</th>
                        <th className="text-center px-2 py-2 font-semibold text-slate-600">الحديد (كجم)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.footings.map((r, i) => (
                        <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="px-3 py-2 font-medium text-slate-700">{r.label}</td>
                          <td className="px-2 py-2 text-center text-slate-600">{r.length}×{r.width}×{r.depth}</td>
                          <td className="px-2 py-2 text-center text-slate-600">{r.quantity}</td>
                          <td className="px-2 py-2 text-center font-semibold text-blue-700">{fmt(r.totalVolume)}</td>
                          <td className="px-2 py-2 text-center font-semibold text-slate-700">{fmt(r.steelKg, 1)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 font-bold text-blue-800 text-right">الإجمالي</td>
                        <td className="px-2 py-2 text-center font-bold text-blue-800">{fmt(summary.totalConcreteVolume)}</td>
                        <td className="px-2 py-2 text-center font-bold text-blue-800">{fmt(summary.totalSteelKg, 1)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Summary cards */}
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
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm text-slate-600">تكلفة الخرسانة التقديرية</span>
                  <span className="font-semibold text-slate-800">{fmt(summary.totalConcreteCost)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm text-slate-600">تكلفة الحديد التقديرية</span>
                  <span className="font-semibold text-slate-800">{fmt(summary.totalSteelCost)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-amber-50 rounded-b-xl">
                  <span className="text-sm font-bold text-amber-800">إجمالي تكلفة المواد</span>
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
