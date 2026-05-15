import { Layer, Line, Arc, Group, Circle } from 'react-konva';
import type { LineElement, DoorElement } from '../../store/types';
import { useAppStore } from '../../store/appStore';
import { getToolDef } from '../tools/TOOLS';

interface Props {
  onDeleteElement?: (type: 'wall' | 'window' | 'door', id: string) => void;
  onUpdateDoor?: (id: string, angleDeg: number) => void;
}

function WallLine({ el, opacity = 1 }: { el: LineElement; opacity?: number }) {
  const def = getToolDef(el.tool);
  return (
    <Line
      points={[el.x1, el.y1, el.x2, el.y2]}
      stroke={el.color}
      strokeWidth={def.strokeWidth}
      dash={def.dashEnabled ? def.dash : undefined}
      lineCap="round"
      opacity={opacity}
    />
  );
}

function DoorShape({ door, onUpdateDoor }: { door: DoorElement; onUpdateDoor?: (id: string, angle: number) => void }) {
  const dx = door.x2 - door.x1;
  const dy = door.y2 - door.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const baseAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const arcStartAngle = baseAngle;
  const arcAngle = door.openingDirection * door.openingAngleDeg;

  return (
    <Group>
      <Line
        points={[door.x1, door.y1, door.x2, door.y2]}
        stroke={door.color}
        strokeWidth={2}
        lineCap="round"
      />
      <Arc
        x={door.x1}
        y={door.y1}
        innerRadius={0}
        outerRadius={length}
        angle={Math.abs(arcAngle)}
        rotation={arcAngle >= 0 ? arcStartAngle : arcStartAngle + arcAngle}
        stroke={door.color}
        strokeWidth={1}
        dash={[4, 3]}
        fill="rgba(79,195,247,0.05)"
      />
      {/* Rotation handle */}
      {onUpdateDoor && (
        <Circle
          x={
            door.x1 +
            length * Math.cos(((arcStartAngle + arcAngle) * Math.PI) / 180)
          }
          y={
            door.y1 +
            length * Math.sin(((arcStartAngle + arcAngle) * Math.PI) / 180)
          }
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
  const { viewSettings, mode } = store;

  const movableOpacity =
    !viewSettings.showMovableWalls && mode === 'plan'
      ? 0
      : viewSettings.movableWallsOpacity;

  return (
    <Layer>
      {/* Fixed walls */}
      {store.walls
        .filter((w) => w.tool === 'wall_fixed')
        .map((w) => (
          <WallLine key={w.id} el={w} />
        ))}

      {/* Movable walls */}
      {store.walls
        .filter((w) => w.tool === 'wall_movable')
        .map((w) => (
          <WallLine key={w.id} el={w} opacity={movableOpacity} />
        ))}

      {/* Windows */}
      {store.windows.map((w) => (
        <WallLine key={w.id} el={w} />
      ))}

      {/* Doors */}
      {store.doors.map((d) => (
        <DoorShape key={d.id} door={d} onUpdateDoor={onUpdateDoor} />
      ))}
    </Layer>
  );
}
