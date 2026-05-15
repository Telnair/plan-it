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
  HistoryAction,
  MeasurementLine,
  RedoItem,
} from './types';
import { getToolDef } from '../components/tools/TOOLS';

const STORAGE_KEY = 'plan-it-state';
const MAX_HISTORY = 50;

type PersistedState = Omit<AppState,
  | 'pendingCalibrationLine'
  | 'pendingAreaPolygon'
  | 'activeToolType'
  | 'activeColor'
  | 'highlightedElementId'
  | 'isSettingAnchor'
  | 'redoStack'
>;

const DEFAULT_PERSISTED: PersistedState = {
  mode: 'draw',
  backgroundImage: null,
  walls: [],
  windows: [],
  doors: [],
  areas: [],
  measurements: [],
  calibration: null,
  history: [],
  tourAnchor: null,
  viewSettings: {
    showMeasurements: true,
    showAreas: true,
    backgroundImageOpacity: 0.5,
    backgroundImageScale: 1,
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
  updateWindow: (id: string, partial: Partial<LineElement>) => void;

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

  addMeasurement: (m: Omit<MeasurementLine, 'id'>) => void;
  removeMeasurement: (id: string) => void;

  removeHistoryEntry: (historyId: string) => void;
  setHighlightedElement: (id: string | null) => void;

  setTourAnchor: (p: Point | null) => void;
  setIsSettingAnchor: (v: boolean) => void;

  undo: () => void;
  canUndo: () => boolean;
  redo: () => void;
  canRedo: () => boolean;

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
    measurements: state.measurements,
    calibration: state.calibration,
    history: state.history,
    tourAnchor: state.tourAnchor,
    viewSettings: state.viewSettings,
  };
  storageAdapter.set(STORAGE_KEY, toSave);
}

function makeHistoryEntry(
  elementId: string,
  elementType: HistoryAction['elementType'],
  label: string,
  toolType: ToolType
): HistoryAction {
  return { id: uuidv4(), elementId, elementType, label, toolType, timestamp: Date.now() };
}

function cappedHistory(history: HistoryAction[], next: HistoryAction): HistoryAction[] {
  const updated = [...history, next];
  if (updated.length > MAX_HISTORY) updated.shift();
  return updated;
}

export const useAppStore = create<Store>((set, get) => {
  const persisted = loadPersistedState();

  return {
    ...persisted,
    activeToolType: 'wall_fixed',
    activeColor: '#1a1a1a',
    pendingCalibrationLine: null,
    pendingAreaPolygon: [],
    highlightedElementId: null,
    isSettingAnchor: false,
    redoStack: [],

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
      const toolLabel =
        wall.tool === 'wall_fixed' ? 'Fixed Wall'
        : wall.tool === 'wall_canal' ? 'Canal / Duct'
        : 'Movable Wall';
      const entry = makeHistoryEntry(newWall.id, 'wall', toolLabel, wall.tool);
      const walls = [...get().walls, newWall];
      const history = cappedHistory(get().history, entry);
      set({ walls, history, redoStack: [] });
      persistState({ ...get(), walls, history });
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
      const entry = makeHistoryEntry(newWin.id, 'window', 'Window', 'window');
      const windows = [...get().windows, newWin];
      const history = cappedHistory(get().history, entry);
      set({ windows, history, redoStack: [] });
      persistState({ ...get(), windows, history });
    },

    removeWindow: (id) => {
      const windows = get().windows.filter((w) => w.id !== id);
      set({ windows });
      persistState({ ...get(), windows });
    },

    updateWindow: (id, partial) => {
      const windows = get().windows.map((w) => (w.id === id ? { ...w, ...partial } : w));
      set({ windows });
      persistState({ ...get(), windows });
    },

    addDoor: (door) => {
      const newDoor = { ...door, id: uuidv4() };
      const entry = makeHistoryEntry(newDoor.id, 'door', 'Door', 'door');
      const doors = [...get().doors, newDoor];
      const history = cappedHistory(get().history, entry);
      set({ doors, history, redoStack: [] });
      persistState({ ...get(), doors, history });
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

    addMeasurement: (m) => {
      const newM = { ...m, id: uuidv4() };
      const measurements = [...get().measurements, newM];
      set({ measurements });
      persistState({ ...get(), measurements });
    },

    removeMeasurement: (id) => {
      const measurements = get().measurements.filter((m) => m.id !== id);
      set({ measurements });
      persistState({ ...get(), measurements });
    },

    addArea: (area) => {
      const newArea = { ...area, id: uuidv4() };
      const entry = makeHistoryEntry(newArea.id, 'area', area.name, 'area_select');
      const areas = [...get().areas, newArea];
      const history = cappedHistory(get().history, entry);
      set({ areas, history, redoStack: [] });
      persistState({ ...get(), areas, history });
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

    setActiveTool: (activeToolType) => {
      const def = getToolDef(activeToolType);
      const activeColor = (def.defaultColor ?? get().activeColor) as GrayShade;
      set({ activeToolType, activeColor });
    },

    setActiveColor: (activeColor) => set({ activeColor }),

    setPendingAreaPolygon: (pendingAreaPolygon) => set({ pendingAreaPolygon }),

    removeHistoryEntry: (historyId) => {
      const entry = get().history.find((h) => h.id === historyId);
      if (!entry) return;

      // Remove the associated element
      if (entry.elementType === 'wall') get().removeWall(entry.elementId);
      else if (entry.elementType === 'window') get().removeWindow(entry.elementId);
      else if (entry.elementType === 'door') get().removeDoor(entry.elementId);
      else if (entry.elementType === 'area') get().removeArea(entry.elementId);

      const history = get().history.filter((h) => h.id !== historyId);
      // Also clear highlight if it was on this element
      const highlightedElementId =
        get().highlightedElementId === entry.elementId ? null : get().highlightedElementId;
      set({ history, highlightedElementId });
      persistState({ ...get(), history });
    },

    setHighlightedElement: (highlightedElementId) => set({ highlightedElementId }),

    setTourAnchor: (tourAnchor) => {
      set({ tourAnchor });
      persistState({ ...get(), tourAnchor });
    },

    setIsSettingAnchor: (isSettingAnchor) => set({ isSettingAnchor }),

    canUndo: () => get().history.length > 0,
    canRedo: () => get().redoStack.length > 0,

    undo: () => {
      const state = get();
      const { history } = state;
      if (history.length === 0) return;
      const last = history[history.length - 1];

      // Snapshot element for potential redo
      let element: LineElement | DoorElement | Area | undefined;
      if (last.elementType === 'wall')   element = state.walls.find((w) => w.id === last.elementId);
      else if (last.elementType === 'window') element = state.windows.find((w) => w.id === last.elementId);
      else if (last.elementType === 'door')   element = state.doors.find((d) => d.id === last.elementId);
      else if (last.elementType === 'area')   element = state.areas.find((a) => a.id === last.elementId);

      const walls   = last.elementType === 'wall'   ? state.walls.filter((w) => w.id !== last.elementId)   : state.walls;
      const windows = last.elementType === 'window' ? state.windows.filter((w) => w.id !== last.elementId) : state.windows;
      const doors   = last.elementType === 'door'   ? state.doors.filter((d) => d.id !== last.elementId)   : state.doors;
      const areas   = last.elementType === 'area'   ? state.areas.filter((a) => a.id !== last.elementId)   : state.areas;
      const newHistory = history.slice(0, -1);
      const highlightedElementId = state.highlightedElementId === last.elementId ? null : state.highlightedElementId;

      const redoStack: RedoItem[] = element
        ? [...state.redoStack, { entry: last, element }].slice(-MAX_HISTORY)
        : state.redoStack;

      set({ walls, windows, doors, areas, history: newHistory, highlightedElementId, redoStack });
      persistState({ ...get(), walls, windows, doors, areas, history: newHistory });
    },

    redo: () => {
      const state = get();
      const { redoStack } = state;
      if (redoStack.length === 0) return;
      const item = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      const { entry, element } = item;
      const newHistory = cappedHistory(state.history, entry);

      if (entry.elementType === 'wall') {
        const walls = [...state.walls, element as LineElement];
        set({ walls, history: newHistory, redoStack: newRedoStack });
        persistState({ ...get(), walls, history: newHistory });
      } else if (entry.elementType === 'window') {
        const windows = [...state.windows, element as LineElement];
        set({ windows, history: newHistory, redoStack: newRedoStack });
        persistState({ ...get(), windows, history: newHistory });
      } else if (entry.elementType === 'door') {
        const doors = [...state.doors, element as DoorElement];
        set({ doors, history: newHistory, redoStack: newRedoStack });
        persistState({ ...get(), doors, history: newHistory });
      } else if (entry.elementType === 'area') {
        const areas = [...state.areas, element as Area];
        set({ areas, history: newHistory, redoStack: newRedoStack });
        persistState({ ...get(), areas, history: newHistory });
      }
    },

    importState: (state) => {
      set({
        ...state,
        measurements: state.measurements ?? [],
        pendingCalibrationLine: null,
        pendingAreaPolygon: [],
        highlightedElementId: null,
      });
      storageAdapter.set(STORAGE_KEY, state);
    },

    resetState: () => {
      storageAdapter.remove(STORAGE_KEY);
      set({
        ...DEFAULT_PERSISTED,
        activeToolType: 'wall_fixed',
        activeColor: '#1a1a1a',
        pendingCalibrationLine: null,
        pendingAreaPolygon: [],
        highlightedElementId: null,
        isSettingAnchor: false,
        redoStack: [],
      });
    },

    persist: () => persistState(get()),
  };
});
