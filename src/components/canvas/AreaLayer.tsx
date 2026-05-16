import { Layer, Line, Text, Group } from 'react-konva';
import { useAppStore } from '../../store/appStore';
import type { Area, Point } from '../../store/types';

function centroid(pts: Point[]): Point {
  const x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const y = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return { x, y };
}

function AreaPolygon({ area }: { area: Area }) {
  const { highlightedElementId, setHighlightedElement } = useAppStore();
  const isSelected = highlightedElementId === area.id;

  if (area.polygon.length < 3) return null;

  const flatPts = area.polygon.flatMap((p) => [p.x, p.y]);
  const c = centroid(area.polygon);
  const strokeColor = isSelected ? area.color.replace('0.35', '1') : area.color.replace('0.35', '0.8');

  return (
    <Group onClick={() => setHighlightedElement(area.id)}>
      <Line
        points={[...flatPts, area.polygon[0].x, area.polygon[0].y]}
        fill={area.color}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        dash={isSelected ? undefined : [5, 3]}
        closed
      />
      <Text
        x={c.x - 60}
        y={c.y - 18}
        width={120}
        text={area.name}
        fontSize={12}
        fontStyle="bold"
        fill="#333"
        align="center"
        listening={false}
      />
      <Text
        x={c.x - 60}
        y={c.y - 2}
        width={120}
        text={`${area.sqMeters.toFixed(1)} m²`}
        fontSize={11}
        fill="#333"
        align="center"
        listening={false}
      />
    </Group>
  );
}

export function AreaLayer() {
  const { areas, viewSettings } = useAppStore();

  if (!viewSettings.showAreas) return <Layer listening={false} />;

  return (
    <Layer>
      {areas.map((area) => (
        <AreaPolygon key={area.id} area={area} />
      ))}
    </Layer>
  );
}
