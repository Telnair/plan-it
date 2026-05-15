
interface WallData {
  id: string;
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  isFixed: boolean;
  color: string;
  tool: string;
  thickness: number;
}

interface Props {
  wall: WallData;
  height: number;
}

export function WallMesh({ wall, height }: Props) {
  const dx = wall.x2 - wall.x1;
  const dz = wall.z2 - wall.z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  if (length < 0.001) return null;

  const cx = (wall.x1 + wall.x2) / 2;
  const cz = (wall.z1 + wall.z2) / 2;
  const angle = Math.atan2(dz, dx);
  const { thickness } = wall;

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
