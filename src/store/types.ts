export type ToolType = 'wall_fixed' | 'wall_movable' | 'wall_canal' | 'window' | 'door' | 'area_select' | 'furniture_select' | 'measure';

export type GrayShade = '#1a1a1a' | '#3d3d3d' | '#6b6b6b' | '#9e9e9e' | '#c8c8c8';

export const GRAY_SHADES: GrayShade[] = [
  '#1a1a1a',
  '#3d3d3d',
  '#6b6b6b',
  '#9e9e9e',
  '#c8c8c8',
];

export type AppMode = 'draw' | 'tour3d';

export interface Point {
  x: number;
  y: number;
}

export interface Calibration {
  pixelsPerMm: number;
}

export interface LineElement {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: GrayShade;
  tool: ToolType;
}

export interface DoorElement extends LineElement {
  tool: 'door';
  openingAngleDeg: number;
  openingDirection: 1 | -1;
  hingeFlipped?: boolean;
}

export interface Area {
  id: string;
  name: string;
  polygon: Point[];
  sqMeters: number;
  color: string;
}

export interface ViewSettings {
  showBackgroundImage: boolean;
  showFixedWalls: boolean;
  showMovableWalls: boolean;
  showCanalWalls: boolean;
  showWindows: boolean;
  showDoors: boolean;
  showGrid: boolean;
  gridOpacity: number;
  gridSize: number;
  showMeasurements: boolean;
  showAreas: boolean;
  showFurniture: boolean;
  backgroundImageOpacity: number;
  backgroundImageScale: number;
}

export interface Furniture {
  id: string;
  name: string;
  polygon: Point[];
  color: string;
}

export interface HistoryAction {
  id: string;
  elementId: string;
  elementType: 'wall' | 'window' | 'door' | 'area' | 'furniture' | 'measurement';
  label: string;
  toolType: ToolType;
  timestamp: number;
}

export interface MeasurementLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AppState {
  mode: AppMode;
  backgroundImage: string | null;
  backgroundImageName: string | null;
  walls: LineElement[];
  windows: LineElement[];
  doors: DoorElement[];
  areas: Area[];
  furniture: Furniture[];
  calibration: Calibration | null;
  viewSettings: ViewSettings;
  history: HistoryAction[];
  measurements: MeasurementLine[];
  tourAnchor: Point | null;
  activeToolType: ToolType;
  activeColor: GrayShade;
  // transient UI state (not persisted)
  pendingCalibrationLine: LineElement | null;
  pendingAreaPolygon: Point[];
  pendingFurniturePolygon: Point[];
  highlightedElementId: string | null;
  isSettingAnchor: boolean;
  redoStack: RedoItem[];
  exportingPNG: boolean;
}

export interface RedoItem {
  entry: HistoryAction;
  element: LineElement | DoorElement | Area | Furniture | MeasurementLine;
}
