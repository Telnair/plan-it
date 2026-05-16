import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { storageAdapter } from '../storage';
import type {
  AppState,
  AppMode,
  LineElement,
  DoorElement,
  Area,
  Furniture,
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
  | 'pendingFurniturePolygon'
  | 'activeToolType'
  | 'activeColor'
  | 'highlightedElementId'
  | 'isSettingAnchor'
  | 'redoStack'
  | 'exportingPNG'
>;

const DEFAULT_PERSISTED: PersistedState = {
  mode: 'draw',
  backgroundImage: null,
  backgroundImageName: null,
  walls: [],
  windows: [],
  doors: [],
  areas: [],
  furniture: [],
  measurements: [],
  calibration: null,
  history: [],
  tourAnchor: null,
  viewSettings: {
    showFixedWalls: true,
    showBackgroundImage: true,
    showGrid: false,
    gridOpacity: 20,
    gridSize: 40,
    showMovableWalls: true,
    showCanalWalls: true,
    showWindows: true,
    showDoors: true,
    showMeasurements: true,
    showAreas: true,
    showFurniture: true,
    backgroundImageOpacity: 0.5,
    backgroundImageScale: 1,
  },
};

function loadPersistedState(): PersistedState {
  const saved = storageAdapter.get<PersistedState>(STORAGE_KEY);
  if (!saved) return DEFAULT_PERSISTED;
  return {
    ...DEFAULT_PERSISTED,
    ...saved,
    // Deep-merge viewSettings so new flags always have their defaults
    viewSettings: { ...DEFAULT_PERSISTED.viewSettings, ...saved.viewSettings },
  };
}

interface AppActions {
  setMode: (mode: AppMode) => void;
  setBackgroundImage: (img: string | null, name?: string | null) => void;

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

  addFurniture: (item: Omit<Furniture, 'id'>) => void;
  removeFurniture: (id: string) => void;
  updateFurniture: (id: string, partial: Partial<Furniture>) => void;
  clearFurniture: () => void;

  clearFixedWalls: () => void;
  clearMovableWalls: () => void;
  clearCanalWalls: () => void;
  clearWindows: () => void;
  clearDoors: () => void;
  clearAreas: () => void;

  setCalibration: (c: Calibration) => void;
  setPendingCalibrationLine: (line: LineElement | null) => void;
  setViewSettings: (v: Partial<ViewSettings>) => void;

  setActiveTool: (tool: ToolType) => void;
  setActiveColor: (color: GrayShade) => void;

  setPendingAreaPolygon: (pts: Point[]) => void;
  setPendingFurniturePolygon: (pts: Point[]) => void;

  addMeasurement: (m: Omit<MeasurementLine, 'id'>) => void;
  removeMeasurement: (id: string) => void;
  updateMeasurement: (id: string, partial: Partial<MeasurementLine>) => void;
  clearMeasurements: () => void;

  removeHistoryEntry: (historyId: string) => void;
  setHighlightedElement: (id: string | null) => void;

  setTourAnchor: (p: Point | null) => void;
  setIsSettingAnchor: (v: boolean) => void;
  setExportingPNG: (v: boolean) => void;

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
    backgroundImageName: state.backgroundImageName,
    walls: state.walls,
    windows: state.windows,
    doors: state.doors,
    areas: state.areas,
    furniture: state.furniture,
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
    pendingFurniturePolygon: [],
    highlightedElementId: null,
    isSettingAnchor: false,
    redoStack: [],
    exportingPNG: false,

    setMode: (mode) => {
      set({ mode });
      persistState({ ...get(), mode });
    },

    setBackgroundImage: (backgroundImage, name) => {
      const backgroundImageName = backgroundImage === null ? null : (name ?? get().backgroundImageName);
      set({ backgroundImage, backgroundImageName });
      persistState({ ...get(), backgroundImage, backgroundImageName });
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
      const entry = makeHistoryEntry(newM.id, 'measurement', 'Measurement', 'measure');
      const measurements = [...get().measurements, newM];
      const history = cappedHistory(get().history, entry);
      set({ measurements, history, redoStack: [] });
      persistState({ ...get(), measurements, history });
    },

    removeMeasurement: (id) => {
      const measurements = get().measurements.filter((m) => m.id !== id);
      set({ measurements });
      persistState({ ...get(), measurements });
    },

    updateMeasurement: (id, partial) => {
      const measurements = get().measurements.map((m) => (m.id === id ? { ...m, ...partial } : m));
      set({ measurements });
      persistState({ ...get(), measurements });
    },

    clearMeasurements: () => {
      const history = get().history.filter((h) => h.elementType !== 'measurement');
      const highlightedElementId = get().measurements.some((m) => m.id === get().highlightedElementId)
        ? null
        : get().highlightedElementId;
      set({ measurements: [], history, highlightedElementId });
      persistState({ ...get(), measurements: [], history });
    },

    clearFixedWalls: () => {
      const fixedIds = new Set(get().walls.filter((w) => w.tool === 'wall_fixed').map((w) => w.id));
      const walls = get().walls.filter((w) => w.tool !== 'wall_fixed');
      const history = get().history.filter((h) => !(h.elementType === 'wall' && fixedIds.has(h.elementId)));
      const highlightedElementId = fixedIds.has(get().highlightedElementId ?? '') ? null : get().highlightedElementId;
      set({ walls, history, highlightedElementId });
      persistState({ ...get(), walls, history });
    },

    clearMovableWalls: () => {
      const movableIds = new Set(get().walls.filter((w) => w.tool === 'wall_movable').map((w) => w.id));
      const walls = get().walls.filter((w) => w.tool !== 'wall_movable');
      const history = get().history.filter((h) => !(h.elementType === 'wall' && movableIds.has(h.elementId)));
      const highlightedElementId = movableIds.has(get().highlightedElementId ?? '') ? null : get().highlightedElementId;
      set({ walls, history, highlightedElementId });
      persistState({ ...get(), walls, history });
    },

    clearCanalWalls: () => {
      const canalIds = new Set(get().walls.filter((w) => w.tool === 'wall_canal').map((w) => w.id));
      const walls = get().walls.filter((w) => w.tool !== 'wall_canal');
      const history = get().history.filter((h) => !(h.elementType === 'wall' && canalIds.has(h.elementId)));
      const highlightedElementId = canalIds.has(get().highlightedElementId ?? '') ? null : get().highlightedElementId;
      set({ walls, history, highlightedElementId });
      persistState({ ...get(), walls, history });
    },

    clearWindows: () => {
      const history = get().history.filter((h) => h.elementType !== 'window');
      const highlightedElementId = get().windows.some((w) => w.id === get().highlightedElementId)
        ? null
        : get().highlightedElementId;
      set({ windows: [], history, highlightedElementId });
      persistState({ ...get(), windows: [], history });
    },

    clearDoors: () => {
      const history = get().history.filter((h) => h.elementType !== 'door');
      const highlightedElementId = get().doors.some((d) => d.id === get().highlightedElementId)
        ? null
        : get().highlightedElementId;
      set({ doors: [], history, highlightedElementId });
      persistState({ ...get(), doors: [], history });
    },

    clearAreas: () => {
      const history = get().history.filter((h) => h.elementType !== 'area');
      const highlightedElementId = get().areas.some((a) => a.id === get().highlightedElementId)
        ? null
        : get().highlightedElementId;
      set({ areas: [], history, highlightedElementId });
      persistState({ ...get(), areas: [], history });
    },

    clearFurniture: () => {
      const history = get().history.filter((h) => h.elementType !== 'furniture');
      const highlightedElementId = get().furniture.some((f) => f.id === get().highlightedElementId)
        ? null
        : get().highlightedElementId;
      set({ furniture: [], history, highlightedElementId });
      persistState({ ...get(), furniture: [], history });
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

    addFurniture: (item) => {
      const newItem = { ...item, id: uuidv4() };
      const entry = makeHistoryEntry(newItem.id, 'furniture', newItem.name, 'furniture_select');
      const furniture = [...get().furniture, newItem];
      const history = cappedHistory(get().history, entry);
      set({ furniture, history, redoStack: [] });
      persistState({ ...get(), furniture, history });
    },

    removeFurniture: (id) => {
      const furniture = get().furniture.filter((f) => f.id !== id);
      set({ furniture });
      persistState({ ...get(), furniture });
    },

    updateFurniture: (id, partial) => {
      const furniture = get().furniture.map((f) => (f.id === id ? { ...f, ...partial } : f));
      set({ furniture });
      persistState({ ...get(), furniture });
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

    setPendingFurniturePolygon: (pendingFurniturePolygon) => set({ pendingFurniturePolygon }),

    removeHistoryEntry: (historyId) => {
      const entry = get().history.find((h) => h.id === historyId);
      if (!entry) return;

      // Remove the associated element
      if (entry.elementType === 'wall') get().removeWall(entry.elementId);
      else if (entry.elementType === 'window') get().removeWindow(entry.elementId);
      else if (entry.elementType === 'door') get().removeDoor(entry.elementId);
      else if (entry.elementType === 'area') get().removeArea(entry.elementId);
      else if (entry.elementType === 'furniture') get().removeFurniture(entry.elementId);
      else if (entry.elementType === 'measurement') get().removeMeasurement(entry.elementId);

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

    setExportingPNG: (exportingPNG) => set({ exportingPNG }),

    canUndo: () => get().history.length > 0,
    canRedo: () => get().redoStack.length > 0,

    undo: () => {
      const state = get();
      const { history } = state;
      if (history.length === 0) return;
      const last = history[history.length - 1];

      // Snapshot element for potential redo
      let element: LineElement | DoorElement | Area | Furniture | MeasurementLine | undefined;
      if (last.elementType === 'wall')        element = state.walls.find((w) => w.id === last.elementId);
      else if (last.elementType === 'window') element = state.windows.find((w) => w.id === last.elementId);
      else if (last.elementType === 'door')   element = state.doors.find((d) => d.id === last.elementId);
      else if (last.elementType === 'area')   element = state.areas.find((a) => a.id === last.elementId);
      else if (last.elementType === 'furniture') element = state.furniture.find((f) => f.id === last.elementId);
      else if (last.elementType === 'measurement') element = state.measurements.find((m) => m.id === last.elementId);

      const walls        = last.elementType === 'wall'        ? state.walls.filter((w) => w.id !== last.elementId)        : state.walls;
      const windows      = last.elementType === 'window'      ? state.windows.filter((w) => w.id !== last.elementId)      : state.windows;
      const doors        = last.elementType === 'door'        ? state.doors.filter((d) => d.id !== last.elementId)        : state.doors;
      const areas        = last.elementType === 'area'        ? state.areas.filter((a) => a.id !== last.elementId)        : state.areas;
      const furniture    = last.elementType === 'furniture'   ? state.furniture.filter((f) => f.id !== last.elementId)    : state.furniture;
      const measurements = last.elementType === 'measurement' ? state.measurements.filter((m) => m.id !== last.elementId) : state.measurements;
      const newHistory = history.slice(0, -1);
      const highlightedElementId = state.highlightedElementId === last.elementId ? null : state.highlightedElementId;

      const redoStack: RedoItem[] = element
        ? [...state.redoStack, { entry: last, element }].slice(-MAX_HISTORY)
        : state.redoStack;

      set({ walls, windows, doors, areas, furniture, measurements, history: newHistory, highlightedElementId, redoStack });
      persistState({ ...get(), walls, windows, doors, areas, furniture, measurements, history: newHistory });
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
      } else if (entry.elementType === 'furniture') {
        const furniture = [...state.furniture, element as Furniture];
        set({ furniture, history: newHistory, redoStack: newRedoStack });
        persistState({ ...get(), furniture, history: newHistory });
      } else if (entry.elementType === 'measurement') {
        const measurements = [...state.measurements, element as MeasurementLine];
        set({ measurements, history: newHistory, redoStack: newRedoStack });
        persistState({ ...get(), measurements, history: newHistory });
      }
    },

    importState: (state) => {
      set({
        ...state,
        measurements: state.measurements ?? [],
        furniture: state.furniture ?? [],
        backgroundImageName: state.backgroundImageName ?? null,
        pendingCalibrationLine: null,
        pendingAreaPolygon: [],
        pendingFurniturePolygon: [],
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
        pendingFurniturePolygon: [],
        highlightedElementId: null,
        isSettingAnchor: false,
        redoStack: [],
        exportingPNG: false,
      });
    },

    persist: () => persistState(get()),
  };
});
