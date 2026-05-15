import type { AppState, LineElement } from './types';

export const selectFixedWalls = (s: AppState): LineElement[] =>
  s.walls.filter((w) => w.tool === 'wall_fixed');

export const selectMovableWalls = (s: AppState): LineElement[] =>
  s.walls.filter((w) => w.tool === 'wall_movable');

export const selectAllElements = (s: AppState) => [
  ...s.walls,
  ...s.windows,
  ...s.doors,
];

export const selectTotalArea = (s: AppState): number =>
  s.areas.reduce((sum, a) => sum + a.sqMeters, 0);
