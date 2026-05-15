import type { ToolType } from '../../store/types';

export interface ToolDef {
  type: ToolType;
  label: string;
  description: string;
  strokeWidth: number;
  dashEnabled: boolean;
  dash?: number[];
}

export const TOOL_DEFS: ToolDef[] = [
  {
    type: 'wall_fixed',
    label: 'Fixed Wall',
    description: 'Structural wall — cannot be removed',
    strokeWidth: 8,
    dashEnabled: false,
  },
  {
    type: 'wall_movable',
    label: 'Movable Wall',
    description: 'Non-structural wall — can be hidden/removed',
    strokeWidth: 4,
    dashEnabled: false,
  },
  {
    type: 'window',
    label: 'Window',
    description: 'Window opening',
    strokeWidth: 3,
    dashEnabled: true,
    dash: [6, 4],
  },
  {
    type: 'door',
    label: 'Door',
    description: 'Door with opening arc',
    strokeWidth: 2,
    dashEnabled: false,
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

export function getToolDef(type: ToolType): ToolDef {
  if (type === 'area_select') return AREA_SELECT_TOOL;
  return TOOL_DEFS.find((t) => t.type === type) ?? TOOL_DEFS[0];
}
