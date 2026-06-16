import { useState } from "react";

interface FormData {
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
              <h2 className="text-base font-bold text-slate-800 mb-4">النتائج</h2>

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

              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
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
          )}
        </div>
      </div>
    </div>
  );
}
