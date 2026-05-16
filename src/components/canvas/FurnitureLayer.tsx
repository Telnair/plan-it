import { useState } from 'react';
import { Layer, Line, Text, Group, Rect } from 'react-konva';
import { useAppStore } from '../../store/appStore';
import { polygonBoundingBox } from '../../utils/geometry';
import { pxToMm, formatMm } from '../../utils/measurement';
import type { Furniture } from '../../store/types';

function centroid(pts: { x: number; y: number }[]) {
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  };
}

function FurniturePolygon({ item }: { item: Furniture }) {
  const { calibration } = useAppStore();
  const [hovered, setHovered] = useState(false);

  if (item.polygon.length < 3) return null;

  const flatPts = item.polygon.flatMap((p) => [p.x, p.y]);
  const c = centroid(item.polygon);

  // Bounding-box dimensions converted to mm when calibration is available
  let dimensionLabel: string | null = null;
  if (calibration) {
    const bb = polygonBoundingBox(item.polygon);
    const wMm = pxToMm(bb.maxX - bb.minX, calibration.pixelsPerMm);
    const hMm = pxToMm(bb.maxY - bb.minY, calibration.pixelsPerMm);
    dimensionLabel = `${formatMm(wMm)} × ${formatMm(hMm)}`;
  }

  const tooltipText = dimensionLabel ?? 'No scale set';
  const tooltipW = tooltipText.length * 7 + 16;
  const tooltipH = 22;
  const tx = c.x - tooltipW / 2;
  const ty = c.y - tooltipH - 6;

  const strokeColor = item.color.replace('0.35', '0.85');

  return (
    <Group
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Polygon fill */}
      <Line
        points={[...flatPts, item.polygon[0].x, item.polygon[0].y]}
        fill={hovered ? item.color.replace('0.35', '0.5') : item.color}
        stroke={strokeColor}
        strokeWidth={1.5}
        dash={[5, 3]}
        closed
      />

      {/* Always-visible name label */}
      <Text
        x={c.x - 60}
        y={c.y - 8}
        width={120}
        text={item.name}
        fontSize={11}
        fontStyle="bold"
        fill="#e0e0e0"
        align="center"
        listening={false}
      />

      {/* Dimension tooltip on hover */}
      {hovered && (
        <Group listening={false}>
          <Rect
            x={tx}
            y={ty}
            width={tooltipW}
            height={tooltipH}
            fill="rgba(18,18,18,0.92)"
            stroke={strokeColor}
            strokeWidth={1}
            cornerRadius={5}
          />
          <Text
            x={tx}
            y={ty + 5}
            width={tooltipW}
            text={tooltipText}
            fontSize={11}
            fontStyle="bold"
            fill="#ffb74d"
            align="center"
          />
        </Group>
      )}
    </Group>
  );
}

export function FurnitureLayer() {
  const furniture = useAppStore((s) => s.furniture);
  const showFurniture = useAppStore((s) => s.viewSettings.showFurniture);

  if (!showFurniture) return <Layer />;

  return (
    <Layer>
      {furniture.map((item) => (
        <FurniturePolygon key={item.id} item={item} />
      ))}
    </Layer>
  );
}
