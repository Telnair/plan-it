import { useState } from 'react';
import { Layer, Line, Circle, Text, Group, Rect } from 'react-konva';
import { useAppStore } from '../../store/appStore';
import { formatMm, lineLengthMm } from '../../utils/measurement';
import type { MeasurementLine } from '../../store/types';

const COLOR = '#4fc3f7';
const HOVER_COLOR = '#81d4fa';

function MeasureLine({ m }: { m: MeasurementLine }) {
  const { removeMeasurement, calibration } = useAppStore();
  const [hovered, setHovered] = useState(false);

  const mx = (m.x1 + m.x2) / 2;
  const my = (m.y1 + m.y2) / 2;

  const lengthLabel = calibration
    ? formatMm(lineLengthMm({ x: m.x1, y: m.y1 }, { x: m.x2, y: m.y2 }, calibration.pixelsPerMm))
    : null;

  const tooltipWidth = lengthLabel ? lengthLabel.length * 8 + 48 : 80;
  const tooltipHeight = 22;
  const tx = mx - tooltipWidth / 2;
  const ty = my - tooltipHeight - 10;

  return (
    <Group
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Wider invisible hit area */}
      <Line
        points={[m.x1, m.y1, m.x2, m.y2]}
        stroke="transparent"
        strokeWidth={16}
      />
      {/* Visible line */}
      <Line
        points={[m.x1, m.y1, m.x2, m.y2]}
        stroke={hovered ? HOVER_COLOR : COLOR}
        strokeWidth={1.5}
        dash={[5, 4]}
        lineCap="butt"
        listening={false}
      />
      {/* End-point dots */}
      <Circle x={m.x1} y={m.y1} radius={3} fill={COLOR} listening={false} />
      <Circle x={m.x2} y={m.y2} radius={3} fill={COLOR} listening={false} />

      {/* Always-visible compact label at midpoint */}
      {lengthLabel && !hovered && (
        <Group listening={false}>
          <Rect
            x={mx - lengthLabel.length * 3.5 - 4}
            y={my - 9}
            width={lengthLabel.length * 7 + 8}
            height={16}
            fill="rgba(18,18,18,0.75)"
            cornerRadius={3}
          />
          <Text
            x={mx - lengthLabel.length * 3.5 - 4}
            y={my - 7}
            width={lengthLabel.length * 7 + 8}
            text={lengthLabel}
            fontSize={10}
            fill={COLOR}
            align="center"
          />
        </Group>
      )}

      {/* Tooltip with remove button on hover */}
      {hovered && lengthLabel && (
        <Group>
          <Rect
            x={tx}
            y={ty}
            width={tooltipWidth}
            height={tooltipHeight}
            fill="rgba(18,18,18,0.92)"
            stroke={COLOR}
            strokeWidth={1}
            cornerRadius={5}
          />
          <Text
            x={tx + 8}
            y={ty + 5}
            text={lengthLabel}
            fontSize={11}
            fontStyle="bold"
            fill={COLOR}
          />
          {/* × remove button */}
          <Group
            x={tx + tooltipWidth - 22}
            y={ty + 1}
            onClick={() => removeMeasurement(m.id)}
            onTap={() => removeMeasurement(m.id)}
          >
            <Rect width={20} height={20} fill="transparent" cornerRadius={4} />
            <Text
              x={2}
              y={3}
              text="×"
              fontSize={13}
              fill="#f44336"
            />
          </Group>
        </Group>
      )}

      {/* Tooltip without length (not calibrated yet) */}
      {hovered && !lengthLabel && (
        <Group>
          <Rect
            x={mx - 60}
            y={my - 32}
            width={120}
            height={22}
            fill="rgba(18,18,18,0.92)"
            stroke={COLOR}
            strokeWidth={1}
            cornerRadius={5}
          />
          <Text
            x={mx - 52}
            y={my - 27}
            text="No scale set"
            fontSize={10}
            fill="#9e9e9e"
          />
          <Group
            x={mx + 36}
            y={my - 31}
            onClick={() => removeMeasurement(m.id)}
            onTap={() => removeMeasurement(m.id)}
          >
            <Rect width={20} height={20} fill="transparent" cornerRadius={4} />
            <Text x={2} y={3} text="×" fontSize={13} fill="#f44336" />
          </Group>
        </Group>
      )}
    </Group>
  );
}

export function MeasurementLayer() {
  const measurements = useAppStore((s) => s.measurements);

  return (
    <Layer>
      {measurements.map((m) => (
        <MeasureLine key={m.id} m={m} />
      ))}
    </Layer>
  );
}
