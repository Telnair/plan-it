import { Layer, Line, Arc, Group, Circle, Shape } from 'react-konva';
import type { LineElement, DoorElement } from '../../store/types';
import { useAppStore } from '../../store/appStore';
import { getToolDef } from '../tools/TOOLS';

interface Props {
  onUpdateDoor?: (id: string, angleDeg: number) => void;
}

function WallLine({
  el,
  opacity = 1,
  highlighted = false,
}: {
  el: LineElement;
  opacity?: number;
  highlighted?: boolean;
}) {
  const def = getToolDef(el.tool);
  return (
    <Group opacity={opacity}>
      {/* Highlight glow rendered behind the main stroke */}
      {highlighted && (
        <Line
          points={[el.x1, el.y1, el.x2, el.y2]}
          stroke="#4fc3f7"
          strokeWidth={def.strokeWidth + 10}
          lineCap="butt"
          lineJoin="miter"
          opacity={0.4}
          listening={false}
        />
      )}
      <Line
        points={[el.x1, el.y1, el.x2, el.y2]}
        stroke={el.color}
        strokeWidth={def.strokeWidth}
        dash={def.dashEnabled ? def.dash : undefined}
        lineCap="butt"
        lineJoin="miter"
      />
    </Group>
  );
}

/** Hollow (outline-only) rectangle drawn along the line axis. */
function CanalWallShape({
  el,
  highlighted = false,
}: {
  el: LineElement;
  highlighted?: boolean;
}) {
  const half = 20; // half of 40px thickness
  const borderWidth = 2;

  return (
    <Group>
      {highlighted && (
        <Shape
          sceneFunc={(ctx, shape) => {
            const dx = el.x2 - el.x1;
            const dy = el.y2 - el.y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 1) return;
            const nx = (-dy / len) * (half + 6);
            const ny = (dx / len) * (half + 6);
            ctx.beginPath();
            ctx.moveTo(el.x1 + nx, el.y1 + ny);
            ctx.lineTo(el.x2 + nx, el.y2 + ny);
            ctx.lineTo(el.x2 - nx, el.y2 - ny);
            ctx.lineTo(el.x1 - nx, el.y1 - ny);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          fill="rgba(79,195,247,0.15)"
          stroke="#4fc3f7"
          strokeWidth={2}
          opacity={0.5}
          listening={false}
        />
      )}
      <Shape
        sceneFunc={(ctx, shape) => {
          const dx = el.x2 - el.x1;
          const dy = el.y2 - el.y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < 1) return;
          const nx = (-dy / len) * half;
          const ny = (dx / len) * half;
          ctx.beginPath();
          ctx.moveTo(el.x1 + nx, el.y1 + ny);
          ctx.lineTo(el.x2 + nx, el.y2 + ny);
          ctx.lineTo(el.x2 - nx, el.y2 - ny);
          ctx.lineTo(el.x1 - nx, el.y1 - ny);
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
        fill="transparent"
        stroke={el.color}
        strokeWidth={borderWidth}
        fillEnabled={false}
      />
    </Group>
  );
}

function DoorShape({
  door,
  highlighted = false,
  onUpdateDoor,
}: {
  door: DoorElement;
  highlighted?: boolean;
  onUpdateDoor?: (id: string, angle: number) => void;
}) {
  const dx = door.x2 - door.x1;
  const dy = door.y2 - door.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const baseAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const arcAngle = door.openingDirection * door.openingAngleDeg;

  return (
    <Group>
      {highlighted && (
        <Line
          points={[door.x1, door.y1, door.x2, door.y2]}
          stroke="#4fc3f7"
          strokeWidth={12}
          lineCap="butt"
          opacity={0.4}
          listening={false}
        />
      )}
      <Line
        points={[door.x1, door.y1, door.x2, door.y2]}
        stroke={door.color}
        strokeWidth={2}
        lineCap="butt"
      />
      <Arc
        x={door.x1}
        y={door.y1}
        innerRadius={0}
        outerRadius={length}
        angle={Math.abs(arcAngle)}
        rotation={arcAngle >= 0 ? baseAngle : baseAngle + arcAngle}
        stroke={door.color}
        strokeWidth={1}
        dash={[4, 3]}
        fill="rgba(79,195,247,0.05)"
      />
      {onUpdateDoor && (
        <Circle
          x={door.x1 + length * Math.cos(((baseAngle + arcAngle) * Math.PI) / 180)}
          y={door.y1 + length * Math.sin(((baseAngle + arcAngle) * Math.PI) / 180)}
          radius={6}
          fill="#4fc3f7"
          draggable
          onDragMove={(e) => {
            const px = e.target.x() - door.x1;
            const py = e.target.y() - door.y1;
            let newAngle = (Math.atan2(py, px) * 180) / Math.PI - baseAngle;
            newAngle = Math.max(-180, Math.min(180, newAngle));
            onUpdateDoor(door.id, Math.abs(newAngle));
          }}
        />
      )}
    </Group>
  );
}

export function ElementsLayer({ onUpdateDoor }: Props) {
  const store = useAppStore();
  const { viewSettings, mode, highlightedElementId } = store;

  const movableOpacity =
    !viewSettings.showMovableWalls && mode === 'plan'
      ? 0
      : viewSettings.movableWallsOpacity;

  return (
    <Layer>
      {store.walls
        .filter((w) => w.tool === 'wall_fixed')
        .map((w) => (
          <WallLine key={w.id} el={w} highlighted={highlightedElementId === w.id} />
        ))}

      {store.walls
        .filter((w) => w.tool === 'wall_movable')
        .map((w) => (
          <WallLine
            key={w.id}
            el={w}
            opacity={movableOpacity}
            highlighted={highlightedElementId === w.id}
          />
        ))}

      {store.walls
        .filter((w) => w.tool === 'wall_canal')
        .map((w) => (
          <CanalWallShape key={w.id} el={w} highlighted={highlightedElementId === w.id} />
        ))}

      {store.windows.map((w) => (
        <WallLine key={w.id} el={w} highlighted={highlightedElementId === w.id} />
      ))}

      {store.doors.map((d) => (
        <DoorShape
          key={d.id}
          door={d}
          highlighted={highlightedElementId === d.id}
          onUpdateDoor={onUpdateDoor}
        />
      ))}
    </Layer>
  );
}
