import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  enabled: boolean;
  speed?: number;
  eyeHeight?: number;
}

export function CameraRig({ enabled, speed = 4, eyeHeight = 1.6 }: Props) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!enabled) return;

    const onDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [enabled]);

  useFrame((_, delta) => {
    if (!enabled) return;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

    const velocity = speed * delta;

    if (keys.current['KeyW'] || keys.current['ArrowUp']) {
      camera.position.addScaledVector(forward, velocity);
    }
    if (keys.current['KeyS'] || keys.current['ArrowDown']) {
      camera.position.addScaledVector(forward, -velocity);
    }
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) {
      camera.position.addScaledVector(right, -velocity);
    }
    if (keys.current['KeyD'] || keys.current['ArrowRight']) {
      camera.position.addScaledVector(right, velocity);
    }

    // Lock eye height
    camera.position.y = eyeHeight;
  });

  return null;
}
