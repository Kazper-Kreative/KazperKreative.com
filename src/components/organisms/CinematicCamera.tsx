"use client";

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { getCameraTransform } from '@/components/utilities/cameraPath';

interface CinematicCameraProps {
  progress: number;
  reducedMotion?: boolean;
}

const CinematicCamera: React.FC<CinematicCameraProps> = ({ progress, reducedMotion = false }) => {
  const { camera } = useThree();

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2, 10),    // Start
      new THREE.Vector3(-2, 0, 0),    // Pass by Act 1
      new THREE.Vector3(4, 3, -10),   // View Act 2 from above
      new THREE.Vector3(0, 1, -25),   // Approach Act 3
      new THREE.Vector3(0, 15, -50),  // Final fly-up
    ]);
  }, []);

  useFrame((state) => {
    const { position, lookAt } = getCameraTransform(curve, progress);
    
    // Smooth follow
    camera.position.lerp(position, reducedMotion ? 0.02 : 0.05);
    camera.lookAt(lookAt);

    if (!reducedMotion) {
      // Dynamic tilt based on horizontal movement
      const targetZ = (position.x - camera.position.x) * 0.5;
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetZ, 0.05);
    }
  });

  return null;
};

export default CinematicCamera;
