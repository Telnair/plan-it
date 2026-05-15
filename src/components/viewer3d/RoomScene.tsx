import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { PointerLockControls, Sky } from '@react-three/drei';
import { useAppStore } from '../../store/appStore';
import { WallMesh } from './WallMesh';
import { FloorMesh } from './FloorMesh';
import { CameraRig } from './CameraRig';
import styled from 'styled-components';
import { Button, Typography } from '@mui/material';
import MouseIcon from '@mui/icons-material/Mouse';

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(18, 18, 18, 0.75);
  backdrop-filter: blur(4px);
  gap: 16px;
  pointer-events: all;
  z-index: 5;
`;

const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const HUD = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 0.78rem;
  color: #9e9e9e;
  pointer-events: none;
  z-index: 4;
`;

const WALL_HEIGHT = 2.5; // metres
const EYE_HEIGHT = 1.6; // metres

function CameraInitializer() {
  const { tourAnchor, calibration } = useAppStore();
  const { camera } = useThree();

  useEffect(() => {
    if (tourAnchor && calibration) {
      const ppm = calibration.pixelsPerMm;
      const x = tourAnchor.x / ppm / 1000;
      const z = tourAnchor.y / ppm / 1000;
      camera.position.set(x, EYE_HEIGHT, z);
    }
  // Only run on mount — not on every anchor change; re-entering the 3D view applies the anchor fresh
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function EmptyScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <gridHelper args={[20, 20, '#333', '#222']} />
    </>
  );
}

export function RoomScene() {
  const store = useAppStore();
  const [locked, setLocked] = useState(false);
  const controlsRef = useRef<any>(null);

  const { walls, windows, calibration } = store;

  // Build 3D geometry data from 2D state
  const wallData = useMemo(() => {
    if (!calibration) return [];
    const ppm = calibration.pixelsPerMm;
    return walls.map((w) => {
      const x1 = w.x1 / ppm / 1000; // px → mm → m
      const z1 = w.y1 / ppm / 1000;
      const x2 = w.x2 / ppm / 1000;
      const z2 = w.y2 / ppm / 1000;
      return { id: w.id, x1, z1, x2, z2, isFixed: w.tool === 'wall_fixed', color: w.color, tool: w.tool };
    });
  }, [walls, calibration]);

  const windowData = useMemo(() => {
    if (!calibration) return [];
    const ppm = calibration.pixelsPerMm;
    return windows.map((w) => ({
      id: w.id,
      x1: w.x1 / ppm / 1000,
      z1: w.y1 / ppm / 1000,
      x2: w.x2 / ppm / 1000,
      z2: w.y2 / ppm / 1000,
    }));
  }, [windows, calibration]);

  // Compute bounding box for floor
  const bounds = useMemo(() => {
    if (wallData.length === 0) return null;
    const xs = wallData.flatMap((w) => [w.x1, w.x2]);
    const zs = wallData.flatMap((w) => [w.z1, w.z2]);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs),
    };
  }, [wallData]);

  const hasGeometry = wallData.length > 0;

  return (
    <CanvasWrapper>
      <Canvas
        camera={{ fov: 75, near: 0.05, far: 500, position: [0, EYE_HEIGHT, 0] }}
        shadows
        gl={{ antialias: true }}
        style={{ background: '#1a1a2e' }}
      >
        <CameraInitializer />
        <Sky sunPosition={[100, 100, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow />

        {hasGeometry && bounds ? (
          <>
            <FloorMesh bounds={bounds} />
            {wallData.map((w) => (
              <WallMesh key={w.id} wall={w} height={WALL_HEIGHT} />
            ))}
            {/* Window panels */}
            {windowData.map((w) => {
              const cx = (w.x1 + w.x2) / 2;
              const cz = (w.z1 + w.z2) / 2;
              const len = Math.sqrt((w.x2 - w.x1) ** 2 + (w.z2 - w.z1) ** 2);
              const angle = Math.atan2(w.z2 - w.z1, w.x2 - w.x1);
              return (
                <mesh key={w.id} position={[cx, WALL_HEIGHT * 0.6, cz]} rotation={[0, -angle, 0]}>
                  <boxGeometry args={[len, WALL_HEIGHT * 0.4, 0.02]} />
                  <meshPhysicalMaterial
                    color="#a8d8ff"
                    transparent
                    opacity={0.3}
                    roughness={0}
                    metalness={0.1}
                  />
                </mesh>
              );
            })}
          </>
        ) : (
          <EmptyScene />
        )}

        <CameraRig enabled={locked} />
        <PointerLockControls
          ref={controlsRef}
          onLock={() => setLocked(true)}
          onUnlock={() => setLocked(false)}
        />
      </Canvas>

      {!locked && (
        <Overlay onClick={() => controlsRef.current?.lock()}>
          <MouseIcon sx={{ fontSize: 48, color: '#4fc3f7' }} />
          <Typography variant="h6" sx={{ color: '#e0e0e0' }}>
            Click to enter 3D Tour
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e', textAlign: 'center', maxWidth: 320 }}>
            {!hasGeometry
              ? 'Draw walls in Draw mode first, then come back here.'
              : 'Use WASD or arrow keys to move, mouse to look around. Press Esc to exit.'}
          </Typography>
          {hasGeometry && (
            <Button variant="contained" color="primary" size="large">
              Enter Tour
            </Button>
          )}
        </Overlay>
      )}

      {locked && (
        <HUD>WASD / Arrow keys — move &nbsp;|&nbsp; Mouse — look &nbsp;|&nbsp; Esc — exit</HUD>
      )}
    </CanvasWrapper>
  );
}
