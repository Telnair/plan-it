import { dist } from './geometry';
import type { Point } from '../store/types';

export function pxToMm(px: number, pixelsPerMm: number): number {
  return px / pixelsPerMm;
}

export function mmToPx(mm: number, pixelsPerMm: number): number {
  return mm * pixelsPerMm;
}

export function lineLengthMm(a: Point, b: Point, pixelsPerMm: number): number {
  return pxToMm(dist(a, b), pixelsPerMm);
}

export function formatMm(mm: number): string {
  if (mm >= 1000) return `${(mm / 1000).toFixed(2)} m`;
  return `${Math.round(mm)} mm`;
}
