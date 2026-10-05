export interface RebarRow { dia: number; lengthM: number; kgPerM: number; kgPerBar: number; }

/** Standard rebar weights (from the reference table) */
export const REBAR_TABLE: RebarRow[] = [
  { dia: 6,  lengthM: 6,  kgPerM: 0.22,  kgPerBar: 1.32 },
  { dia: 8,  lengthM: 6,  kgPerM: 0.395, kgPerBar: 2.37 },
  { dia: 8,  lengthM: 12, kgPerM: 0.395, kgPerBar: 4.74 },
  { dia: 10, lengthM: 12, kgPerM: 0.617, kgPerBar: 7.404 },
  { dia: 12, lengthM: 12, kgPerM: 0.888, kgPerBar: 10.66 },
  { dia: 14, lengthM: 12, kgPerM: 1.209, kgPerBar: 14.511 },
  { dia: 16, lengthM: 12, kgPerM: 1.579, kgPerBar: 18.95 },
  { dia: 18, lengthM: 12, kgPerM: 1.999, kgPerBar: 23.98 },
  { dia: 20, lengthM: 12, kgPerM: 2.468, kgPerBar: 29.616 },
  { dia: 22, lengthM: 12, kgPerM: 2.986, kgPerBar: 35.83 },
  { dia: 25, lengthM: 12, kgPerM: 3.856, kgPerBar: 46.275 },
  { dia: 28, lengthM: 12, kgPerM: 4.837, kgPerBar: 58.05 },
  { dia: 32, lengthM: 12, kgPerM: 6.318, kgPerBar: 75.817 },
];

/** Whole bars needed to cover totalKg if everything were one diameter */
export function rebarCount(totalKg: number, kgPerBar: number): number {
  return totalKg > 0 ? Math.ceil(totalKg / kgPerBar) : 0;
}
