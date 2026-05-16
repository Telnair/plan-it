import { useState } from 'react';
import { Layer, Line, Circle, Text, Group, Rect } from 'react-konva';
import { useAppStore } from '../../store/appStore';
import { formatMm, lineLengthMm } from '../../utils/measurement';
import type { MeasurementLine } from '../../store/types';

const COLOR = '#4fc3f7';
const HOVER_COLOR = '#81d4fa';
const SELECTED_COLOR = '#ffffff';

function MeasureLine({ m }: { m: MeasurementLine }) {
  const { calibration, highlightedElementId, setHighlightedElement, exportingPNG } = useAppStore();
  const [hovered, setHovered] = useState(false);

  const isSelected = highlightedElementId === m.id;

  const mx = (m.x1 + m.x2) / 2;
  const my = (m.y1 + m.y2) / 2;

  const lengthLabel = calibration
    ? formatMm(lineLengthMm({ x: m.x1, y: m.y1 }, { x: m.x2, y: m.y2 }, calibration.pixelsPerMm))
    : null;

  const lineColor = isSelected ? SELECTED_COLOR : hovered ? HOVER_COLOR : COLOR;

  // Label shown on hover or during PNG export
  const showLabel = (hovered || exportingPNG) && lengthLabel;

  const tooltipWidth = lengthLabel ? lengthLabel.length * 8 + 16 : 80;
  const tooltipHeight = 22;
  const tx = mx - tooltipWidth / 2;
  const ty = my - tooltipHeight - 10;

  return (
    <Group
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setHighlightedElement(isSelected ? null : m.id)}
      onTap={() => setHighlightedElement(isSelected ? null : m.id)}
    >
      {/* Wider invisible hit area */}
      <Line
        points={[m.x1, m.y1, m.x2, m.y2]}
        stroke="transparent"
        strokeWidth={16}
      />

      {/* Selection glow */}
      {isSelected && (
        <Line
          points={[m.x1, m.y1, m.x2, m.y2]}
          stroke={SELECTED_COLOR}
          strokeWidth={5}
          opacity={0.18}
          dash={[5, 4]}
          lineCap="butt"
          listening={false}
        />
      )}

      {/* Visible line */}
      <Line
        points={[m.x1, m.y1, m.x2, m.y2]}
        stroke={lineColor}
        strokeWidth={isSelected ? 2 : 1.5}
        dash={[5, 4]}
        lineCap="butt"
        listening={false}
      />

      {/* End-point dots */}
      <Circle x={m.x1} y={m.y1} radius={3} fill={lineColor} listening={false} />
      <Circle x={m.x2} y={m.y2} radius={3} fill={lineColor} listening={false} />

      {/* Length label — shown on hover or when exporting PNG */}
      {showLabel && (
        <Group listening={false}>
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
            x={tx}
            y={ty + 5}
            width={tooltipWidth}
            text={lengthLabel}
            fontSize={11}
            fontStyle="bold"
            fill={COLOR}
            align="center"
          />
        </Group>
      )}

      {/* "No scale set" hint on hover (no remove button) */}
      {hovered && !lengthLabel && !exportingPNG && (
        <Group listening={false}>
          <Rect
            x={mx - 52}
            y={my - 32}
            width={104}
            height={22}
            fill="rgba(18,18,18,0.92)"
            stroke={COLOR}
            strokeWidth={1}
            cornerRadius={5}
          />
          <Text
            x={mx - 52}
            y={my - 27}
            width={104}
            text="No scale set"
            fontSize={10}
            fill="#9e9e9e"
            align="center"
          />
        </Group>
      )}
    </Group>
  );
}

export function MeasurementLayer() {
  const measurements = useAppStore((s) => s.measurements);
  const showMeasurements = useAppStore((s) => s.viewSettings.showMeasurements);

  if (!showMeasurements) return <Layer />;

  return (
    <Layer>
      {measurements.map((m) => (
        <MeasureLine key={m.id} m={m} />
      ))}
    </Layer>
  );
}
