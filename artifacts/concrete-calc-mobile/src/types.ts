export type TabId = "footings" | "columns" | "beams" | "slabs";
export type SlabSubType = "solid" | "hollow" | "flat" | "waffle";
export type ResultsTab = "byType" | "byFloor" | "boq";

export interface Floor {
  id: string;
  name: string;
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export const DEFAULT_FLOOR_ID = "floor-ground";

export const initialFloors: Floor[] = [{ id: DEFAULT_FLOOR_ID, name: "الدور الأرضي" }];

export interface ElementType {
  id: string;
  label: string;
  dim1: string;
  dim2: string;
  dim3: string;
  quantity: string;
  floorId: string;
}

export const newElement = (floorId: string = DEFAULT_FLOOR_ID): ElementType => ({
  id: generateId(),
  label: "",
  dim1: "",
  dim2: "",
  dim3: "",
  quantity: "1",
  floorId,
});

export interface ProjectInfo {
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

export const initialProject: ProjectInfo = {
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

export interface MixDesign {
  cement: string;
  sand: string;
  gravel: string;
  compactionFactor: string;
  bagWeightKg: string;
}

export const initialMix: MixDesign = {
  cement: "1",
  sand: "2",
  gravel: "4",
  compactionFactor: "1.54",
  bagWeightKg: "50",
};

export const MIX_PRESETS: { label: string; grade: string; c: string; s: string; g: string }[] = [
  { label: "1:2:4",   grade: "B200 / C16", c: "1", s: "2",   g: "4" },
  { label: "1:1.5:3", grade: "B250 / C20", c: "1", s: "1.5", g: "3" },
  { label: "1:1:2",   grade: "B300 / C25", c: "1", s: "1",   g: "2" },
];

export interface SavedProject {
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

export interface ElementResult {
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

export interface SectionSummary {
  elements: ElementResult[];
  totalVolume: number;
  totalSteelKg: number;
  totalSteelTons: number;
  concreteCost: number;
  steelCost: number;
  total: number;
}

export interface FloorBreakdown {
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

export interface FullSummary {
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

export interface MixResult {
  dryVolume: number;
  cementVolume: number;
  sandVolume: number;
  gravelVolume: number;
  cementBags: number;
}

export interface BOQItem {
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

export const BOQ_META: { key: keyof FullSummary; typeLabel: string; typeCode: string }[] = [
  { key: "footings",    typeLabel: "قواعد",         typeCode: "F"  },
  { key: "columns",     typeLabel: "أعمدة",          typeCode: "C"  },
  { key: "beams",       typeLabel: "كمرات",          typeCode: "B"  },
  { key: "solidSlabs",  typeLabel: "بلاطة مصمتة",    typeCode: "SS" },
  { key: "hollowSlabs", typeLabel: "بلاطة مجوفة",    typeCode: "HS" },
  { key: "flatSlabs",   typeLabel: "بلاطة مسطحة",    typeCode: "FS" },
  { key: "waffleSlabs", typeLabel: "بلاطة واف",      typeCode: "WS" },
];

export const TAB_META: { id: TabId; label: string; dim1Label: string; dim2Label: string; dim3Label: string; defaultLabel: string }[] = [
  { id: "footings", label: "القواعد",  dim1Label: "الطول (م)", dim2Label: "العرض (م)", dim3Label: "السمك (م)",    defaultLabel: "F" },
  { id: "columns",  label: "الأعمدة", dim1Label: "العرض (م)", dim2Label: "العمق (م)", dim3Label: "الارتفاع (م)", defaultLabel: "C" },
  { id: "beams",    label: "الكمرات", dim1Label: "العرض (م)", dim2Label: "العمق (م)", dim3Label: "الطول (م)",    defaultLabel: "B" },
  { id: "slabs",    label: "البلاطات",dim1Label: "الطول (م)", dim2Label: "العرض (م)", dim3Label: "السمك (م)",    defaultLabel: "S" },
];

export const SLAB_SUBTYPES: { id: SlabSubType; label: string; shortLabel: string; steelRatioKey: keyof ProjectInfo; concreteRatioKey?: keyof ProjectInfo; defaultLabel: string }[] = [
  { id: "solid",  label: "بلاطة مصمتة",         shortLabel: "مصمتة", steelRatioKey: "solidSlabSteelRatio",  defaultLabel: "SS" },
  { id: "hollow", label: "بلاطة مجوفة (هولوكور)", shortLabel: "مجوفة", steelRatioKey: "hollowSlabSteelRatio", concreteRatioKey: "hollowConcreteRatio", defaultLabel: "HS" },
  { id: "flat",   label: "بلاطة مسطحة",          shortLabel: "مسطحة", steelRatioKey: "flatSlabSteelRatio",   defaultLabel: "FS" },
  { id: "waffle", label: "بلاطة واف",             shortLabel: "واف",   steelRatioKey: "waffleSlabSteelRatio", concreteRatioKey: "waffleConcreteRatio", defaultLabel: "WS" },
];
