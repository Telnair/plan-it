
interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface Props {
  bounds: Bounds;
}

export function FloorMesh({ bounds }: Props) {
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;

  const padding = 1;

  return (
    <>
      {/* Floor — warm beige laminate */}
      <mesh position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width + padding * 2, depth + padding * 2]} />
        <meshStandardMaterial color="#c4a882" roughness={0.85} metalness={0.02} />
      </mesh>
      {/* Ceiling — white */}
      <mesh position={[cx, 2.5, cz]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + padding * 2, depth + padding * 2]} />
        <meshStandardMaterial color="#ffffff" roughness={1} side={2} />
      </mesh>
    </>
  );
}
