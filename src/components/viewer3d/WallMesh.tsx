
interface WallData {
  id: string;
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  isFixed: boolean;
  color: string;
  tool: string;
}

interface Props {
  wall: WallData;
  height: number;
}

const TOOL_THICKNESS: Record<string, number> = {
  wall_fixed: 0.20,
  wall_movable: 0.10,
  wall_canal: 0.40,
};

export function WallMesh({ wall, height }: Props) {
  const dx = wall.x2 - wall.x1;
  const dz = wall.z2 - wall.z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  if (length < 0.001) return null;

  const cx = (wall.x1 + wall.x2) / 2;
  const cz = (wall.z1 + wall.z2) / 2;
  const angle = Math.atan2(dz, dx);
  const thickness = TOOL_THICKNESS[wall.tool] ?? 0.15;

  const wallColor = '#d0d0d0';

  return (
    <mesh
      position={[cx, height / 2, cz]}
      rotation={[0, -angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color={wallColor} roughness={0.85} metalness={0} />
    </mesh>
  );
}
