import type { ToolType, GrayShade } from '../../store/types';

export interface ToolDef {
  type: ToolType;
  label: string;
  description: string;
  strokeWidth: number;
  dashEnabled: boolean;
  dash?: number[];
  defaultColor?: GrayShade;
}

export const TOOL_DEFS: ToolDef[] = [
  {
    type: 'wall_fixed',
    label: 'Fixed Wall',
    description: 'Structural wall — cannot be removed',
    strokeWidth: 20,
    dashEnabled: false,
    defaultColor: '#1a1a1a',
  },
  {
    type: 'wall_movable',
    label: 'Movable Wall',
    description: 'Non-structural wall — can be hidden/removed',
    strokeWidth: 10,
    dashEnabled: false,
    defaultColor: '#9e9e9e',
  },
  {
    type: 'wall_canal',
    label: 'Canal / Duct',
    description: 'Communications or ventilation canal — hollow thick wall',
    strokeWidth: 40,
    dashEnabled: false,
    defaultColor: '#1a1a1a',
  },
  {
    type: 'window',
    label: 'Window',
    description: 'Window opening',
    strokeWidth: 3,
    dashEnabled: true,
    dash: [6, 4],
    defaultColor: '#9e9e9e',
  },
  {
    type: 'door',
    label: 'Door',
    description: 'Door with opening arc',
    strokeWidth: 2,
    dashEnabled: false,
    defaultColor: '#3d3d3d',
  },
];

export const AREA_SELECT_TOOL: ToolDef = {
  type: 'area_select',
  label: 'Area',
  description: 'Click corners to mark a named area',
  strokeWidth: 1,
  dashEnabled: true,
  dash: [4, 4],
};

export const FURNITURE_TOOL: ToolDef = {
  type: 'furniture_select',
  label: 'Furniture',
  description: 'Click corners to outline a furniture item',
  strokeWidth: 1,
  dashEnabled: true,
  dash: [4, 4],
};

export const MEASURE_TOOL: ToolDef = {
  type: 'measure',
  label: 'Measure',
  description: 'Draw a measurement line — hover to see length, click × to remove',
  strokeWidth: 1.5,
  dashEnabled: true,
  dash: [5, 4],
  defaultColor: '#4fc3f7' as never,
};

export function getToolDef(type: ToolType): ToolDef {
  if (type === 'area_select') return AREA_SELECT_TOOL;
  if (type === 'furniture_select') return FURNITURE_TOOL;
  if (type === 'measure') return MEASURE_TOOL;
  return TOOL_DEFS.find((t) => t.type === type) ?? TOOL_DEFS[0];
}
