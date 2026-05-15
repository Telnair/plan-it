import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { storageAdapter } from '../storage';
import type {
  AppState,
  AppMode,
  LineElement,
  DoorElement,
  Area,
  GrayShade,
  ToolType,
  ViewSettings,
  Calibration,
  Point,
} from './types';

const STORAGE_KEY = 'plan-it-state';

type PersistedState = Omit<AppState,
  'pendingCalibrationLine' | 'pendingAreaPolygon' | 'activeToolType' | 'activeColor'
>;

const DEFAULT_PERSISTED: PersistedState = {
  mode: 'draw',
  backgroundImage: null,
  walls: [],
  windows: [],
  doors: [],
  areas: [],
  calibration: null,
  viewSettings: {
    showMovableWalls: true,
    movableWallsOpacity: 1,
  },
};

function loadPersistedState(): PersistedState {
  const saved = storageAdapter.get<PersistedState>(STORAGE_KEY);
  if (!saved) return DEFAULT_PERSISTED;
  return { ...DEFAULT_PERSISTED, ...saved };
}

interface AppActions {
  setMode: (mode: AppMode) => void;
  setBackgroundImage: (img: string | null) => void;

  addWall: (wall: Omit<LineElement, 'id'>) => void;
  removeWall: (id: string) => void;
  updateWall: (id: string, partial: Partial<LineElement>) => void;

  addWindow: (win: Omit<LineElement, 'id'>) => void;
  removeWindow: (id: string) => void;

  addDoor: (door: Omit<DoorElement, 'id'>) => void;
  removeDoor: (id: string) => void;
  updateDoor: (id: string, partial: Partial<DoorElement>) => void;

  addArea: (area: Omit<Area, 'id'>) => void;
  removeArea: (id: string) => void;
  updateArea: (id: string, partial: Partial<Area>) => void;

  setCalibration: (c: Calibration) => void;
  setPendingCalibrationLine: (line: LineElement | null) => void;
  setViewSettings: (v: Partial<ViewSettings>) => void;

  setActiveTool: (tool: ToolType) => void;
  setActiveColor: (color: GrayShade) => void;

  setPendingAreaPolygon: (pts: Point[]) => void;

  importState: (state: PersistedState) => void;
  resetState: () => void;
  persist: () => void;
}

type Store = AppState & AppActions;

function persistState(state: Store) {
  const toSave: PersistedState = {
    mode: state.mode,
    backgroundImage: state.backgroundImage,
    walls: state.walls,
    windows: state.windows,
    doors: state.doors,
    areas: state.areas,
    calibration: state.calibration,
    viewSettings: state.viewSettings,
  };
  storageAdapter.set(STORAGE_KEY, toSave);
}

export const useAppStore = create<Store>((set, get) => {
  const persisted = loadPersistedState();

  return {
    ...persisted,
    activeToolType: 'wall_fixed',
    activeColor: '#3d3d3d',
    pendingCalibrationLine: null,
    pendingAreaPolygon: [],

    setMode: (mode) => {
      set({ mode });
      persistState({ ...get(), mode });
    },

    setBackgroundImage: (backgroundImage) => {
      set({ backgroundImage });
      persistState({ ...get(), backgroundImage });
    },

    addWall: (wall) => {
      const newWall = { ...wall, id: uuidv4() };
      const walls = [...get().walls, newWall];
      set({ walls });
      persistState({ ...get(), walls });
    },

    removeWall: (id) => {
      const walls = get().walls.filter((w) => w.id !== id);
      set({ walls });
      persistState({ ...get(), walls });
    },

    updateWall: (id, partial) => {
      const walls = get().walls.map((w) => (w.id === id ? { ...w, ...partial } : w));
      set({ walls });
      persistState({ ...get(), walls });
    },

    addWindow: (win) => {
      const newWin = { ...win, id: uuidv4() };
      const windows = [...get().windows, newWin];
      set({ windows });
      persistState({ ...get(), windows });
    },

    removeWindow: (id) => {
      const windows = get().windows.filter((w) => w.id !== id);
      set({ windows });
      persistState({ ...get(), windows });
    },

    addDoor: (door) => {
      const newDoor = { ...door, id: uuidv4() };
      const doors = [...get().doors, newDoor];
      set({ doors });
      persistState({ ...get(), doors });
    },

    removeDoor: (id) => {
      const doors = get().doors.filter((d) => d.id !== id);
      set({ doors });
      persistState({ ...get(), doors });
    },

    updateDoor: (id, partial) => {
      const doors = get().doors.map((d) => (d.id === id ? { ...d, ...partial } : d));
      set({ doors });
      persistState({ ...get(), doors });
    },

    addArea: (area) => {
      const newArea = { ...area, id: uuidv4() };
      const areas = [...get().areas, newArea];
      set({ areas });
      persistState({ ...get(), areas });
    },

    removeArea: (id) => {
      const areas = get().areas.filter((a) => a.id !== id);
      set({ areas });
      persistState({ ...get(), areas });
    },

    updateArea: (id, partial) => {
      const areas = get().areas.map((a) => (a.id === id ? { ...a, ...partial } : a));
      set({ areas });
      persistState({ ...get(), areas });
    },

    setCalibration: (calibration) => {
      set({ calibration });
      persistState({ ...get(), calibration });
    },

    setPendingCalibrationLine: (pendingCalibrationLine) => set({ pendingCalibrationLine }),

    setViewSettings: (v) => {
      const viewSettings = { ...get().viewSettings, ...v };
      set({ viewSettings });
      persistState({ ...get(), viewSettings });
    },

    setActiveTool: (activeToolType) => set({ activeToolType }),
    setActiveColor: (activeColor) => set({ activeColor }),

    setPendingAreaPolygon: (pendingAreaPolygon) => set({ pendingAreaPolygon }),

    importState: (state) => {
      set({ ...state, pendingCalibrationLine: null, pendingAreaPolygon: [] });
      storageAdapter.set(STORAGE_KEY, state);
    },

    resetState: () => {
      storageAdapter.remove(STORAGE_KEY);
      set({
        ...DEFAULT_PERSISTED,
        activeToolType: 'wall_fixed',
        activeColor: '#3d3d3d',
        pendingCalibrationLine: null,
        pendingAreaPolygon: [],
      });
    },

    persist: () => persistState(get()),
  };
});
