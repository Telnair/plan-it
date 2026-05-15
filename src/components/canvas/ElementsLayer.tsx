import { Layer, Line, Arc, Group, Circle, Shape } from 'react-konva';
import type { LineElement, DoorElement } from '../../store/types';
import { useAppStore } from '../../store/appStore';
import { getToolDef } from '../tools/TOOLS';

interface Props {
  onUpdateDoor?: (id: string, partial: Partial<import('../../store/types').DoorElement>) => void;
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
  const { setHighlightedElement } = useAppStore();

  function handleSelect() {
    setHighlightedElement(highlighted ? null : el.id);
  }

  return (
    <Group opacity={opacity} onClick={handleSelect} onTap={handleSelect}>
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
        hitStrokeWidth={Math.max(def.strokeWidth, 12)}
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
  const borderWidth = 8;
  // Subtract half the stroke width so the outer VISUAL edge sits at exactly
  // strokeWidth/2 (20 px) from the centre line, matching the 40 px cursor preview.
  const half = 20 - borderWidth / 2; // = 16 px path offset → 16+4 = 20 px visual edge
  const { setHighlightedElement } = useAppStore();

  function handleSelect() {
    setHighlightedElement(highlighted ? null : el.id);
  }

  return (
    <Group onClick={handleSelect} onTap={handleSelect}>
      {highlighted && (
        <Shape
          sceneFunc={(ctx, shape) => {
            const dx = el.x2 - el.x1;
            const dy = el.y2 - el.y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 1) return;
            const nx = (-dy / len) * (half + 6);
            const ny = (dx / len) * (half + 6);
            // inset endpoints so highlight glow also stays within bounds
            const lx = (dx / len) * (borderWidth / 2);
            const ly = (dy / len) * (borderWidth / 2);
            ctx.beginPath();
            ctx.moveTo(el.x1 + lx + nx, el.y1 + ly + ny);
            ctx.lineTo(el.x2 - lx + nx, el.y2 - ly + ny);
            ctx.lineTo(el.x2 - lx - nx, el.y2 - ly - ny);
            ctx.lineTo(el.x1 + lx - nx, el.y1 + ly - ny);
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
          // inset endpoints by half the stroke width so the outer stroke edge
          // lands exactly at (el.x1, el.y1) and (el.x2, el.y2)
          const lx = (dx / len) * (borderWidth / 2);
          const ly = (dy / len) * (borderWidth / 2);
          ctx.beginPath();
          ctx.moveTo(el.x1 + lx + nx, el.y1 + ly + ny);
          ctx.lineTo(el.x2 - lx + nx, el.y2 - ly + ny);
          ctx.lineTo(el.x2 - lx - nx, el.y2 - ly - ny);
          ctx.lineTo(el.x1 + lx - nx, el.y1 + ly - ny);
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
  onUpdateDoor?: (id: string, partial: Partial<DoorElement>) => void;
}) {
  const { setHighlightedElement } = useAppStore();

  function handleSelect() {
    setHighlightedElement(highlighted ? null : door.id);
  }

  // Determine hinge vs tip based on hingeFlipped flag
  const hx = door.hingeFlipped ? door.x2 : door.x1;
  const hy = door.hingeFlipped ? door.y2 : door.y1;
  const tx = door.hingeFlipped ? door.x1 : door.x2;
  const ty = door.hingeFlipped ? door.y1 : door.y2;

  const dx = tx - hx;
  const dy = ty - hy;
  const length = Math.sqrt(dx * dx + dy * dy);
  const baseAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const arcAngle = door.openingDirection * door.openingAngleDeg;

  // Position of the draggable arc-end handle
  const handleX = hx + length * Math.cos(((baseAngle + arcAngle) * Math.PI) / 180);
  const handleY = hy + length * Math.sin(((baseAngle + arcAngle) * Math.PI) / 180);

  // Midpoint of the door segment — anchor for the "flip direction" button
  const midX = (door.x1 + door.x2) / 2;
  const midY = (door.y1 + door.y2) / 2;

  return (
    <Group onClick={handleSelect} onTap={handleSelect}>
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
        hitStrokeWidth={12}
      />
      <Arc
        x={hx}
        y={hy}
        innerRadius={0}
        outerRadius={length}
        angle={Math.abs(arcAngle)}
        rotation={arcAngle >= 0 ? baseAngle : baseAngle + arcAngle}
        stroke={door.color}
        strokeWidth={1}
        dash={[4, 3]}
        fill="rgba(79,195,247,0.05)"
      />

      {/* Angle drag handle — always visible so the user can adjust arc without selecting first */}
      {onUpdateDoor && (
        <Circle
          x={handleX}
          y={handleY}
          radius={6}
          fill="#4fc3f7"
          draggable
          onClick={(e) => e.cancelBubble = true}
          onTap={(e) => e.cancelBubble = true}
          onDragMove={(e) => {
            e.cancelBubble = true;
            const px = e.target.x() - hx;
            const py = e.target.y() - hy;
            let newAngle = (Math.atan2(py, px) * 180) / Math.PI - baseAngle;
            newAngle = Math.max(-180, Math.min(180, newAngle));
            onUpdateDoor(door.id, { openingAngleDeg: Math.abs(newAngle) });
          }}
        />
      )}

      {/* Flip direction button — shown when highlighted */}
      {highlighted && onUpdateDoor && (
        <Group
          x={midX}
          y={midY - 18}
          onClick={(e) => { e.cancelBubble = true; onUpdateDoor(door.id, { openingDirection: door.openingDirection === 1 ? -1 : 1 }); }}
          onTap={(e) => { e.cancelBubble = true; onUpdateDoor(door.id, { openingDirection: door.openingDirection === 1 ? -1 : 1 }); }}
        >
          <Circle radius={10} fill="#1e1e1e" stroke="#4fc3f7" strokeWidth={1.5} />
          <Line
            points={[-4, 2, 0, -3, 4, 2]}
            stroke="#4fc3f7"
            strokeWidth={1.5}
            lineCap="round"
            lineJoin="round"
          />
        </Group>
      )}

      {/* Flip hinge button — shown at non-hinge end when highlighted */}
      {highlighted && onUpdateDoor && (
        <Group
          x={tx}
          y={ty}
          onClick={(e) => { e.cancelBubble = true; onUpdateDoor(door.id, { hingeFlipped: !door.hingeFlipped }); }}
          onTap={(e) => { e.cancelBubble = true; onUpdateDoor(door.id, { hingeFlipped: !door.hingeFlipped }); }}
        >
          <Circle radius={9} fill="#1e1e1e" stroke="#ffb74d" strokeWidth={1.5} />
          <Line
            points={[-4, 0, 4, 0]}
            stroke="#ffb74d"
            strokeWidth={1.5}
            lineCap="round"
          />
          <Line
            points={[2, -3, 4, 0, 2, 3]}
            stroke="#ffb74d"
            strokeWidth={1.5}
            lineCap="round"
            lineJoin="round"
          />
        </Group>
      )}
    </Group>
  );
}

export function ElementsLayer({ onUpdateDoor }: Props) {
  const store = useAppStore();
  const { highlightedElementId } = store;

  return (
    <Layer>
      {store.walls
        .filter((w) => w.tool === 'wall_movable')
        .map((w) => (
          <WallLine key={w.id} el={w} highlighted={highlightedElementId === w.id} />
        ))}

      {store.walls
        .filter((w) => w.tool === 'wall_fixed')
        .map((w) => (
          <WallLine key={w.id} el={w} highlighted={highlightedElementId === w.id} />
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
