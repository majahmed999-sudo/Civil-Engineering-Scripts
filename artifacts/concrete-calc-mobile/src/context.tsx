import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  ElementType, Floor, ProjectInfo, MixDesign, FullSummary,
  SavedProject, TabId, SlabSubType, ResultsTab,
  initialProject, initialMix, initialFloors, newElement, generateId, DEFAULT_FLOOR_ID,
} from './types';
import { computeFull, isPricesValid, isElementValid } from './calculations';
import { loadProjects as loadStorage, saveProjects as saveStorage } from './storage';

interface AppState {
  project: ProjectInfo;
  floors: Floor[];
  footings: ElementType[];
  columns: ElementType[];
  beams: ElementType[];
  solidSlabs: ElementType[];
  hollowSlabs: ElementType[];
  flatSlabs: ElementType[];
  waffleSlabs: ElementType[];
  mix: MixDesign;
  includeSteel: boolean;
  summary: FullSummary | null;
  savedProjects: SavedProject[];
  activeTab: TabId;
  slabSubTab: SlabSubType;
  resultsTab: ResultsTab;
  showSavedPanel: boolean;
}

interface AppContextValue extends AppState {
  setProject: React.Dispatch<React.SetStateAction<ProjectInfo>>;
  setFloors: React.Dispatch<React.SetStateAction<Floor[]>>;
  setFootings: React.Dispatch<React.SetStateAction<ElementType[]>>;
  setColumns: React.Dispatch<React.SetStateAction<ElementType[]>>;
  setBeams: React.Dispatch<React.SetStateAction<ElementType[]>>;
  setSolidSlabs: React.Dispatch<React.SetStateAction<ElementType[]>>;
  setHollowSlabs: React.Dispatch<React.SetStateAction<ElementType[]>>;
  setFlatSlabs: React.Dispatch<React.SetStateAction<ElementType[]>>;
  setWaffleSlabs: React.Dispatch<React.SetStateAction<ElementType[]>>;
  setMix: React.Dispatch<React.SetStateAction<MixDesign>>;
  setIncludeSteel: React.Dispatch<React.SetStateAction<boolean>>;
  setSummary: React.Dispatch<React.SetStateAction<FullSummary | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
  setSlabSubTab: React.Dispatch<React.SetStateAction<SlabSubType>>;
  setResultsTab: React.Dispatch<React.SetStateAction<ResultsTab>>;
  setShowSavedPanel: React.Dispatch<React.SetStateAction<boolean>>;
  handleCalculate: () => void;
  handleReset: () => void;
  saveProject: (name: string) => void;
  loadProject: (sp: SavedProject) => void;
  deleteProject: (id: string) => void;
  addElement: (setter: React.Dispatch<React.SetStateAction<ElementType[]>>, floorId: string) => void;
  removeElement: (elements: ElementType[], setter: React.Dispatch<React.SetStateAction<ElementType[]>>, id: string) => void;
  handleElementChange: (setter: React.Dispatch<React.SetStateAction<ElementType[]>>, id: string, field: string, value: string) => void;
  handleProjectChange: (name: string, value: string) => void;
  addFloor: () => void;
  removeFloor: (floorId: string) => void;
  allElements: { [key: string]: ElementType[] };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectInfo>(initialProject);
  const [floors, setFloors] = useState<Floor[]>(initialFloors);
  const [footings, setFootings] = useState<ElementType[]>([newElement()]);
  const [columns, setColumns] = useState<ElementType[]>([newElement()]);
  const [beams, setBeams] = useState<ElementType[]>([newElement()]);
  const [solidSlabs, setSolidSlabs] = useState<ElementType[]>([newElement()]);
  const [hollowSlabs, setHollowSlabs] = useState<ElementType[]>([newElement()]);
  const [flatSlabs, setFlatSlabs] = useState<ElementType[]>([newElement()]);
  const [waffleSlabs, setWaffleSlabs] = useState<ElementType[]>([newElement()]);
  const [mix, setMix] = useState<MixDesign>(initialMix);
  const [includeSteel, setIncludeSteel] = useState(true);
  const [summary, setSummary] = useState<FullSummary | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("footings");
  const [slabSubTab, setSlabSubTab] = useState<SlabSubType>("solid");
  const [resultsTab, setResultsTab] = useState<ResultsTab>("byType");
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  useEffect(() => {
    loadStorage().then(setSavedProjects);
  }, []);

  const handleProjectChange = useCallback((name: string, value: string) => {
    setProject((p) => ({ ...p, [name]: value }));
  }, []);

  const handleElementChange = useCallback((
    setter: React.Dispatch<React.SetStateAction<ElementType[]>>,
    id: string, field: string, value: string
  ) => {
    setter((prev) => prev.map((el) => el.id === id ? { ...el, [field]: value } : el));
  }, []);

  const addElement = useCallback((
    setter: React.Dispatch<React.SetStateAction<ElementType[]>>,
    floorId: string
  ) => {
    setter((prev) => [...prev, newElement(floorId)]);
  }, []);

  const removeElement = useCallback((
    elements: ElementType[],
    setter: React.Dispatch<React.SetStateAction<ElementType[]>>,
    id: string
  ) => {
    if (elements.length <= 1) return;
    setter((prev) => prev.filter((el) => el.id !== id));
  }, []);

  const addFloor = useCallback(() => {
    const newFloor: Floor = { id: generateId(), name: `الدور ${floors.length + 1}` };
    setFloors((prev) => [...prev, newFloor]);
  }, [floors.length]);

  const removeFloor = useCallback((floorId: string) => {
    if (floors.length <= 1) return;
    const fallback = floors.find((f) => f.id !== floorId)!.id;
    setFloors((prev) => prev.filter((f) => f.id !== floorId));
    const reassign = (els: ElementType[]) => els.map((el) => el.floorId === floorId ? { ...el, floorId: fallback } : el);
    setFootings((prev) => reassign(prev));
    setColumns((prev) => reassign(prev));
    setBeams((prev) => reassign(prev));
    setSolidSlabs((prev) => reassign(prev));
    setHollowSlabs((prev) => reassign(prev));
    setFlatSlabs((prev) => reassign(prev));
    setWaffleSlabs((prev) => reassign(prev));
  }, [floors]);

  const allElements: { [key: string]: ElementType[] } = {
    footings, columns, beams, solidSlabs, hollowSlabs, flatSlabs, waffleSlabs,
  };

  const handleCalculate = useCallback(() => {
    const calcProject = includeSteel ? project : { ...project, steelPricePerTon: "1" };
    const s = computeFull(
      footings, columns, beams,
      solidSlabs, hollowSlabs, flatSlabs, waffleSlabs,
      floors, calcProject,
    );
    setSummary(s);
  }, [footings, columns, beams, solidSlabs, hollowSlabs, flatSlabs, waffleSlabs, floors, project, includeSteel]);

  const handleReset = useCallback(() => {
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
  }, []);

  const saveProject = useCallback((name: string) => {
    const entry: SavedProject = {
      id: generateId(),
      name: name || project.projectName || "مشروع بدون اسم",
      savedAt: Date.now(),
      project,
      floors,
      footings, columns, beams,
      solidSlabs, hollowSlabs, flatSlabs, waffleSlabs,
      mix, includeSteel,
    };
    const updated = [entry, ...savedProjects];
    saveStorage(updated);
    setSavedProjects(updated);
  }, [project, floors, footings, columns, beams, solidSlabs, hollowSlabs, flatSlabs, waffleSlabs, mix, includeSteel, savedProjects]);

  const loadProject = useCallback((sp: SavedProject) => {
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
    setShowSavedPanel(false);
  }, []);

  const deleteProject = useCallback((id: string) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    saveStorage(updated);
    setSavedProjects(updated);
  }, [savedProjects]);

  const value: AppContextValue = {
    project, floors,
    footings, columns, beams,
    solidSlabs, hollowSlabs, flatSlabs, waffleSlabs,
    mix, includeSteel, summary, savedProjects,
    activeTab, slabSubTab, resultsTab, showSavedPanel,
    setProject, setFloors,
    setFootings, setColumns, setBeams,
    setSolidSlabs, setHollowSlabs, setFlatSlabs, setWaffleSlabs,
    setMix, setIncludeSteel, setSummary,
    setActiveTab, setSlabSubTab, setResultsTab, setShowSavedPanel,
    handleCalculate, handleReset, saveProject, loadProject, deleteProject,
    addElement, removeElement, handleElementChange, handleProjectChange,
    addFloor, removeFloor,
    allElements,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
