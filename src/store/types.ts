export type ToolType = 'wall_fixed' | 'wall_movable' | 'window' | 'door' | 'area_select';

export type GrayShade = '#1a1a1a' | '#3d3d3d' | '#6b6b6b' | '#9e9e9e' | '#c8c8c8';

export const GRAY_SHADES: GrayShade[] = [
  '#1a1a1a',
  '#3d3d3d',
  '#6b6b6b',
  '#9e9e9e',
  '#c8c8c8',
];

export type AppMode = 'draw' | 'plan' | 'tour3d';

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
}

export interface Area {
  id: string;
  name: string;
  polygon: Point[];
  sqMeters: number;
  color: string;
}

export interface ViewSettings {
  showMovableWalls: boolean;
  movableWallsOpacity: number;
  backgroundImageOpacity: number;
}

export interface HistoryAction {
  id: string;
  elementId: string;
  elementType: 'wall' | 'window' | 'door' | 'area';
  label: string;
  toolType: ToolType;
  timestamp: number;
}

export interface AppState {
  mode: AppMode;
  backgroundImage: string | null;
  walls: LineElement[];
  windows: LineElement[];
  doors: DoorElement[];
  areas: Area[];
  calibration: Calibration | null;
  viewSettings: ViewSettings;
  history: HistoryAction[];
  activeToolType: ToolType;
  activeColor: GrayShade;
  // transient UI state (not persisted)
  pendingCalibrationLine: LineElement | null;
  pendingAreaPolygon: Point[];
  highlightedElementId: string | null;
}
