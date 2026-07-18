import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedProject } from './types';

const LS_KEY = "structural-calc-projects";

export async function loadProjects(): Promise<SavedProject[]> {
  try {
    const raw = await AsyncStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) as SavedProject[] : [];
  } catch {
    return [];
  }
}

export async function saveProjects(list: SavedProject[]): Promise<void> {
  await AsyncStorage.setItem(LS_KEY, JSON.stringify(list));
}

export async function deleteProject(id: string): Promise<SavedProject[]> {
  const list = await loadProjects();
  const updated = list.filter((p) => p.id !== id);
  await saveProjects(updated);
  return updated;
}
