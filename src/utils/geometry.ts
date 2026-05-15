import type { Point } from '../store/types';

export function dist(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export function angleDeg(a: Point, b: Point): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

/** Snap end point to the nearest 45° angle from start */
export function snapTo45(start: Point, end: Point): Point {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
  const d = dist(start, end);
  return {
    x: start.x + d * Math.cos(snapped),
    y: start.y + d * Math.sin(snapped),
  };
}

/** Snap a point to the nearest grid cell */
export function snapToGrid(pt: Point, gridSize: number): Point {
  return {
    x: Math.round(pt.x / gridSize) * gridSize,
    y: Math.round(pt.y / gridSize) * gridSize,
  };
}

/**
 * Shoelace formula for signed polygon area in canvas units squared.
 * Returns absolute value.
 */
export function polygonArea(pts: Point[]): number {
  if (pts.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area / 2);
}

/** Convert canvas-unit area to square meters given pixelsPerMm */
export function pxAreaToSqMeters(pxArea: number, pixelsPerMm: number): number {
  const mmArea = pxArea / (pixelsPerMm * pixelsPerMm);
  return mmArea / 1_000_000; // mm² → m²
}

/** Check if a point is inside a polygon (ray-casting) */
export function pointInPolygon(pt: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Midpoint of two points */
export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
