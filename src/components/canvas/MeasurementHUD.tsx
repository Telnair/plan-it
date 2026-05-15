import { Text, Rect, Group } from 'react-konva';
import { formatMm, lineLengthMm } from '../../utils/measurement';
import type { Point } from '../../store/types';

interface Props {
  start: Point;
  end: Point;
  pixelsPerMm: number;
}

export function MeasurementHUD({ start, end, pixelsPerMm }: Props) {
  const mm = lineLengthMm(start, end, pixelsPerMm);
  const label = formatMm(mm);
  const width = label.length * 8 + 16;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const isMoreVertical = Math.abs(dy) >= Math.abs(dx);

  // For vertical strokes: place to the right so it never overlaps the line
  // For horizontal strokes: place to the leading side (ahead of the cursor)
  const mx = isMoreVertical
    ? end.x + 52
    : dx >= 0 ? end.x + 14 : end.x - width - 14;
  const my = end.y - 10;

  return (
    <Group>
      <Rect
        x={mx - width / 2}
        y={my - 12}
        width={width}
        height={20}
        fill="rgba(30,30,30,0.85)"
        cornerRadius={4}
      />
      <Text
        x={mx - width / 2}
        y={my - 10}
        width={width}
        text={label}
        fontSize={11}
        fill="#4fc3f7"
        fontStyle="bold"
        align="center"
      />
    </Group>
  );
}
