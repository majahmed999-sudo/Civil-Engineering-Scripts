import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface FormData {
  projectName: string;
  engineerName: string;
  clientName: string;
  length: string;
  width: string;
  depth: string;
  numberOfFootings: string;
  concretePricePerM3: string;
  steelRatio: string;
  steelPricePerTon: string;
}

interface Results {
  volumePerFooting: number;
  totalConcreteVolume: number;
  totalConcreteCost: number;
  totalSteelWeightKg: number;
  totalSteelWeightTons: number;
  totalSteelCost: number;
  totalProjectCost: number;
}

const initialForm: FormData = {
  projectName: "",
  engineerName: "",
  clientName: "",
  length: "",
  width: "",
  depth: "",
  numberOfFootings: "",
  concretePricePerM3: "",
  steelRatio: "80",
  steelPricePerTon: "",
};

function calculate(form: FormData): Results {
  const length = parseFloat(form.length);
  const width = parseFloat(form.width);
  const depth = parseFloat(form.depth);
  const numberOfFootings = parseInt(form.numberOfFootings);
  const concretePricePerM3 = parseFloat(form.concretePricePerM3);
  const steelRatio = parseFloat(form.steelRatio || "80");
  const steelPricePerTon = parseFloat(form.steelPricePerTon);

  const volumePerFooting = length * width * depth;
  const totalConcreteVolume = volumePerFooting * numberOfFootings;
  const totalConcreteCost = totalConcreteVolume * concretePricePerM3;
  const totalSteelWeightKg = totalConcreteVolume * steelRatio;
  const totalSteelWeightTons = totalSteelWeightKg / 1000;
  const totalSteelCost = totalSteelWeightTons * steelPricePerTon;
  const totalProjectCost = totalConcreteCost + totalSteelCost;

  return {
    volumePerFooting,
    totalConcreteVolume,
    totalConcreteCost,
    totalSteelWeightKg,
    totalSteelWeightTons,
    totalSteelCost,
    totalProjectCost,
  };
}

function isFormValid(form: FormData): boolean {
  return (
    form.length !== "" &&
    form.width !== "" &&
    form.depth !== "" &&
    form.numberOfFootings !== "" &&
    form.concretePricePerM3 !== "" &&
    form.steelPricePerTon !== "" &&
    !isNaN(parseFloat(form.length)) &&
    !isNaN(parseFloat(form.width)) &&
    !isNaN(parseFloat(form.depth)) &&
    !isNaN(parseInt(form.numberOfFootings)) &&
    !isNaN(parseFloat(form.concretePricePerM3)) &&
    !isNaN(parseFloat(form.steelPricePerTon)) &&
    parseFloat(form.length) > 0 &&
    parseFloat(form.width) > 0 &&
    parseFloat(form.depth) > 0 &&
    parseInt(form.numberOfFootings) > 0
  );
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("ar-EG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function App() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [results, setResults] = useState<Results | null>(null);
  const [exporting, setExporting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setResults(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isFormValid(form)) {
      setResults(calculate(form));
    }
  }

  function handleReset() {
    setForm(initialForm);
    setResults(null);
  }

  async function handleExportPDF() {
    if (!resultsRef.current || !results) return;
    setExporting(true);

    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      const now = new Date();
      const dateStr = now.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 32, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      const headerTitle = form.projectName
        ? form.projectName
        : "Foundation Quantity Calculator";
      pdf.text(headerTitle, pageWidth / 2, 13, { align: "center" });

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Concrete & Reinforcement Steel — Quantity Report", pageWidth / 2, 22, { align: "center" });

      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(dateStr, pageWidth - margin, 40, { align: "right" });

      const infoY = 40;
      if (form.engineerName || form.clientName) {
        pdf.setTextColor(51, 65, 85);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        if (form.engineerName) {
          pdf.text(`Engineer: ${form.engineerName}`, margin, infoY);
        }
        if (form.clientName) {
          const clientX = form.engineerName ? pageWidth / 2 : margin;
          pdf.text(`Client: ${form.clientName}`, clientX, infoY);
        }
      }

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.line(margin, 45, pageWidth - margin, 45);

      const startY = 50;
      const availableHeight = pageHeight - startY - margin;
      const finalImgHeight = Math.min(imgHeight, availableHeight);

      pdf.addImage(imgData, "PNG", margin, startY, contentWidth, finalImgHeight);

      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text("Generated by Concrete & Steel Calculator", pageWidth / 2, pageHeight - 6, { align: "center" });

      pdf.save(`concrete-steel-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">حاسبة كميات القواعد</h1>
          <p className="text-slate-500 mt-1 text-sm">خرسانة وحديد تسليح</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <section>
                <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  بيانات المشروع والتوثيق
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">اسم المشروع <span className="text-slate-400">(اختياري)</span></label>
                    <input
                      type="text"
                      name="projectName"
                      value={form.projectName}
                      onChange={handleChange}
                      placeholder="مثال: مشروع فلل الريان — قواعد الطابق الأرضي"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">اسم المهندس <span className="text-slate-400">(اختياري)</span></label>
                      <input
                        type="text"
                        name="engineerName"
                        value={form.engineerName}
                        onChange={handleChange}
                        placeholder="م. أحمد الشمري"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">اسم العميل <span className="text-slate-400">(اختياري)</span></label>
                      <input
                        type="text"
                        name="clientName"
                        value={form.clientName}
                        onChange={handleChange}
                        placeholder="المقاول / صاحب العمل"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-100" />

              <section>
                <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">1</span>
                  أبعاد القاعدة
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">الطول (م)</label>
                    <input
                      type="number"
                      name="length"
                      value={form.length}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">العرض (م)</label>
                    <input
                      type="number"
                      name="width"
                      value={form.width}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">السمك (م)</label>
                    <input
                      type="number"
                      name="depth"
                      value={form.depth}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-100" />

              <section>
                <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">2</span>
                  بيانات الخرسانة
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">عدد القواعد</label>
                    <input
                      type="number"
                      name="numberOfFootings"
                      value={form.numberOfFootings}
                      onChange={handleChange}
                      placeholder="0"
                      min="1"
                      step="1"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">سعر م³ الخرسانة</label>
                    <input
                      type="number"
                      name="concretePricePerM3"
                      value={form.concretePricePerM3}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-100" />

              <section>
                <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">3</span>
                  بيانات حديد التسليح
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      معدل الحديد (كجم/م³)
                      <span className="text-slate-400 mr-1">— افتراضي 80</span>
                    </label>
                    <input
                      type="number"
                      name="steelRatio"
                      value={form.steelRatio}
                      onChange={handleChange}
                      placeholder="80"
                      min="1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">سعر طن الحديد</label>
                    <input
                      type="number"
                      name="steelPricePerTon"
                      value={form.steelPricePerTon}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-center"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                type="submit"
                disabled={!isFormValid(form)}
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg disabled:shadow-none"
              >
                احسب الكميات
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition"
              >
                مسح
              </button>
            </div>
          </form>

          {results && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">النتائج</h2>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm"
                >
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

              <div ref={resultsRef} className="space-y-3 bg-white rounded-xl p-4">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-700 text-base text-center">
                    {form.projectName || "تقرير حاسبة كميات القواعد"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 text-center">
                    {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  {(form.engineerName || form.clientName) && (
                    <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
                      {form.engineerName && (
                        <div className="text-xs">
                          <span className="text-slate-400">المهندس: </span>
                          <span className="font-semibold text-slate-700">{form.engineerName}</span>
                        </div>
                      )}
                      {form.clientName && (
                        <div className="text-xs">
                          <span className="text-slate-400">العميل: </span>
                          <span className="font-semibold text-slate-700">{form.clientName}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">الطول × العرض × السمك</p>
                    <p className="font-semibold text-slate-700 text-sm">
                      {form.length} × {form.width} × {form.depth} م
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">عدد القواعد</p>
                    <p className="font-semibold text-slate-700 text-sm">{form.numberOfFootings} قاعدة</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">معدل الحديد</p>
                    <p className="font-semibold text-slate-700 text-sm">{form.steelRatio} كجم/م³</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-600 rounded-xl p-4 text-white">
                    <p className="text-blue-100 text-xs mb-1">حجم الخرسانة الإجمالي</p>
                    <p className="text-2xl font-bold">{fmt(results.totalConcreteVolume)}</p>
                    <p className="text-blue-200 text-xs">متر مكعب</p>
                  </div>
                  <div className="bg-slate-700 rounded-xl p-4 text-white">
                    <p className="text-slate-300 text-xs mb-1">وزن الحديد الإجمالي</p>
                    <p className="text-2xl font-bold">{fmt(results.totalSteelWeightTons, 3)}</p>
                    <p className="text-slate-400 text-xs">طن ({fmt(results.totalSteelWeightKg)} كجم)</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 mt-2">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-slate-600">حجم القاعدة الواحدة</span>
                    <span className="font-semibold text-slate-800">{fmt(results.volumePerFooting)} م³</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-slate-600">تكلفة الخرسانة التقديرية</span>
                    <span className="font-semibold text-slate-800">{fmt(results.totalConcreteCost)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-slate-600">تكلفة الحديد التقديرية</span>
                    <span className="font-semibold text-slate-800">{fmt(results.totalSteelCost)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-amber-50 rounded-b-xl">
                    <span className="text-sm font-bold text-amber-800">إجمالي تكلفة المواد</span>
                    <span className="text-lg font-bold text-amber-700">{fmt(results.totalProjectCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
