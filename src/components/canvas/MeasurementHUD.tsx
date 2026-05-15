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
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2 - 20;
  const width = label.length * 8 + 16;

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
