import {
  ElementType, ElementResult, SectionSummary, ProjectInfo, FullSummary,
  FloorBreakdown, Floor, MixDesign, MixResult, BOQItem, BOQ_META,
} from './types';

export function isElementValid(e: ElementType): boolean {
  return parseFloat(e.dim1) > 0 && parseFloat(e.dim2) > 0 && parseFloat(e.dim3) > 0 && parseInt(e.quantity) > 0;
}

export function isPricesValid(p: ProjectInfo, requireSteel = true): boolean {
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

export function computeFull(
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

export function computeMix(totalVolume: number, m: MixDesign): MixResult {
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

export function computeBOQ(
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
    const section = summary[key] as import('./types').SectionSummary;
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

export function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("ar-EG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
