import { Layer, Line, Circle, Text } from 'react-konva';
import type { Point } from '../../store/types';
import { useAppStore } from '../../store/appStore';
import { getToolDef } from '../tools/TOOLS';
import { MeasurementHUD } from './MeasurementHUD';
import { dist } from '../../utils/geometry';

interface Props {
  drawStart: Point | null;
  drawEnd: Point | null;
  areaPolygon: Point[];
}

export function DrawingLayer({ drawStart, drawEnd, areaPolygon }: Props) {
  const { activeToolType, activeColor, calibration } = useAppStore();
  const def = getToolDef(activeToolType);

  const showLine = drawStart && drawEnd;
  const showMeasurement = showLine && calibration;

  return (
    <Layer listening={false}>
      {/* Active in-progress area polygon */}
      {areaPolygon.length > 0 &&
        areaPolygon.map((pt, i) => {
          const next = areaPolygon[i + 1];
          return next ? (
            <Line
              key={i}
              points={[pt.x, pt.y, next.x, next.y]}
              stroke="#4fc3f7"
              strokeWidth={1.5}
              dash={[5, 3]}
            />
          ) : null;
        })}
      {areaPolygon.length > 0 && drawEnd && (
        <Line
          points={[areaPolygon[areaPolygon.length - 1].x, areaPolygon[areaPolygon.length - 1].y, drawEnd.x, drawEnd.y]}
          stroke="#4fc3f7"
          strokeWidth={1.5}
          dash={[5, 3]}
        />
      )}
      {areaPolygon.map((pt, i) => (
        <Circle key={`ap-${i}`} x={pt.x} y={pt.y} radius={4} fill="#4fc3f7" />
      ))}

      {/* Line being drawn */}
      {showLine && activeToolType !== 'area_select' && (
        <Line
          points={[drawStart.x, drawStart.y, drawEnd.x, drawEnd.y]}
          stroke={activeColor}
          strokeWidth={def.strokeWidth}
          dash={def.dashEnabled ? def.dash : undefined}
          lineCap="round"
          opacity={0.7}
        />
      )}

      {/* Measurement label */}
      {showMeasurement && activeToolType !== 'area_select' && (
        <MeasurementHUD
          start={drawStart!}
          end={drawEnd!}
          pixelsPerMm={calibration.pixelsPerMm}
        />
      )}

      {/* Start anchor dot */}
      {drawStart && activeToolType !== 'area_select' && (
        <Circle x={drawStart.x} y={drawStart.y} radius={4} fill={activeColor} />
      )}

      {/* Cursor length (without calibration) hint */}
      {showLine && !calibration && activeToolType !== 'area_select' && (
        <>
          <Text
            x={drawEnd!.x + 10}
            y={drawEnd!.y - 8}
            text={`${Math.round(dist(drawStart!, drawEnd!))} px`}
            fontSize={11}
            fill="#9e9e9e"
          />
        </>
      )}
    </Layer>
  );
}
