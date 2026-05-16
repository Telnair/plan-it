import { Layer, Line, Circle, Text, Rect, Group } from 'react-konva';
import type { Point } from '../../store/types';
import { useAppStore } from '../../store/appStore';
import { getToolDef } from '../tools/TOOLS';
import { MeasurementHUD } from './MeasurementHUD';
import { dist } from '../../utils/geometry';
import { lineLengthMm, formatMm } from '../../utils/measurement';

interface Props {
  drawStart: Point | null;
  drawEnd: Point | null;
  areaPolygon: Point[];
  furniturePolygon: Point[];
  cursorPos: Point | null;
}

export function DrawingLayer({ drawStart, drawEnd, areaPolygon, furniturePolygon, cursorPos }: Props) {
  const { activeToolType, activeColor, calibration, tourAnchor } = useAppStore();
  const def = getToolDef(activeToolType);

  const isPolygonTool = activeToolType === 'area_select' || activeToolType === 'furniture_select';
  const showSquareCursor = cursorPos && !isPolygonTool && activeToolType !== 'measure';
  const cursorSize = def.strokeWidth;
  const cursorColor = activeToolType === 'measure' ? '#4fc3f7' : activeColor;

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

      {/* Active in-progress furniture polygon */}
      {furniturePolygon.length > 0 &&
        furniturePolygon.map((pt, i) => {
          const next = furniturePolygon[i + 1];
          if (!next) return null;
          const mx = (pt.x + next.x) / 2;
          const my = (pt.y + next.y) / 2;
          return (
            <Group key={`fp-seg-${i}`}>
              <Line
                points={[pt.x, pt.y, next.x, next.y]}
                stroke="#ffb74d"
                strokeWidth={1.5}
                dash={[5, 3]}
              />
              {calibration ? (() => {
                const label = formatMm(lineLengthMm(pt, next, calibration.pixelsPerMm));
                const w = label.length * 8 + 16;
                return (
                  <Group>
                    <Rect x={mx - w / 2} y={my - 12} width={w} height={20} fill="rgba(30,30,30,0.85)" cornerRadius={4} />
                    <Text x={mx - w / 2} y={my - 10} width={w} text={label} fontSize={11} fill="#ffb74d" fontStyle="bold" align="center" />
                  </Group>
                );
              })() : (
                <Text
                  x={mx + 6}
                  y={my - 8}
                  text={`${Math.round(dist(pt, next))} px`}
                  fontSize={11}
                  fill="#9e9e9e"
                />
              )}
            </Group>
          );
        })}
      {furniturePolygon.length > 0 && drawEnd && (
        <Line
          points={[furniturePolygon[furniturePolygon.length - 1].x, furniturePolygon[furniturePolygon.length - 1].y, drawEnd.x, drawEnd.y]}
          stroke="#ffb74d"
          strokeWidth={1.5}
          dash={[5, 3]}
        />
      )}
      {furniturePolygon.length > 0 && drawEnd && calibration && (
        <MeasurementHUD
          start={furniturePolygon[furniturePolygon.length - 1]}
          end={drawEnd}
          pixelsPerMm={calibration.pixelsPerMm}
        />
      )}
      {furniturePolygon.length > 0 && drawEnd && !calibration && (
        <Text
          x={drawEnd.x + 10}
          y={drawEnd.y - 8}
          text={`${Math.round(dist(furniturePolygon[furniturePolygon.length - 1], drawEnd))} px`}
          fontSize={11}
          fill="#9e9e9e"
        />
      )}
      {furniturePolygon.map((pt, i) => (
        <Circle key={`fp-${i}`} x={pt.x} y={pt.y} radius={4} fill="#ffb74d" />
      ))}

      {/* Line being drawn */}
      {showLine && !isPolygonTool && (
        <Line
          points={[drawStart.x, drawStart.y, drawEnd.x, drawEnd.y]}
          stroke={activeToolType === 'measure' ? '#4fc3f7' : activeColor}
          strokeWidth={def.strokeWidth}
          dash={def.dashEnabled ? def.dash : undefined}
          lineCap="butt"
          lineJoin="miter"
          opacity={0.7}
        />
      )}

      {/* Measurement label */}
      {showMeasurement && !isPolygonTool && (
        <MeasurementHUD
          start={drawStart!}
          end={drawEnd!}
          pixelsPerMm={calibration.pixelsPerMm}
        />
      )}

      {/* Start anchor dot */}
      {drawStart && !isPolygonTool && (
        <Circle x={drawStart.x} y={drawStart.y} radius={4} fill={activeColor} />
      )}

      {/* Cursor length (without calibration) hint */}
      {showLine && !calibration && !isPolygonTool && (
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

      {/* Crosshair cursor: hollow square showing line boundaries + lines marking the center */}
      {showSquareCursor && (() => {
        const cx = cursorPos!.x;
        const cy = cursorPos!.y;
        const half = cursorSize / 2;
        const arm = half + 6;
        return (
          <>
            <Rect
              x={cx - half}
              y={cy - half}
              width={cursorSize}
              height={cursorSize}
              fill="transparent"
              stroke={cursorColor}
              strokeWidth={1.5}
              listening={false}
              opacity={0.9}
            />
            <Line
              points={[cx - arm, cy, cx + arm, cy]}
              stroke={cursorColor}
              strokeWidth={1}
              listening={false}
              opacity={0.9}
            />
            <Line
              points={[cx, cy - arm, cx, cy + arm]}
              stroke={cursorColor}
              strokeWidth={1}
              listening={false}
              opacity={0.9}
            />
          </>
        );
      })()}

      {/* Tour anchor marker */}
      {tourAnchor && (
        <>
          <Circle
            x={tourAnchor.x}
            y={tourAnchor.y}
            radius={8}
            fill="#ff7043"
            stroke="#fff"
            strokeWidth={1.5}
            listening={false}
          />
          <Text
            x={tourAnchor.x + 12}
            y={tourAnchor.y - 7}
            text="Entrance"
            fontSize={11}
            fill="#ff7043"
            listening={false}
          />
        </>
      )}
    </Layer>
  );
}
