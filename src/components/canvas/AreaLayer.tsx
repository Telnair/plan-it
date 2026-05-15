import { Layer, Line, Text, Group } from 'react-konva';
import { useAppStore } from '../../store/appStore';
import type { Point } from '../../store/types';

function centroid(pts: Point[]): Point {
  const x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const y = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return { x, y };
}

export function AreaLayer() {
  const { areas, viewSettings } = useAppStore();

  if (!viewSettings.showAreas) return <Layer listening={false} />;

  return (
    <Layer listening={false}>
      {areas.map((area) => {
        if (area.polygon.length < 3) return null;
        const flatPts = area.polygon.flatMap((p) => [p.x, p.y]);
        const c = centroid(area.polygon);
        return (
          <Group key={area.id}>
            <Line
              points={[...flatPts, area.polygon[0].x, area.polygon[0].y]}
              fill={area.color}
              stroke={area.color.replace('0.35', '0.8')}
              strokeWidth={1.5}
              dash={[5, 3]}
              closed
            />
            <Text
              x={c.x - 60}
              y={c.y - 18}
              width={120}
              text={area.name}
              fontSize={12}
              fontStyle="bold"
              fill="#e0e0e0"
              align="center"
            />
            <Text
              x={c.x - 60}
              y={c.y - 2}
              width={120}
              text={`${area.sqMeters.toFixed(1)} m²`}
              fontSize={11}
              fill="#4fc3f7"
              align="center"
            />
          </Group>
        );
      })}
    </Layer>
  );
}
