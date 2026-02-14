"use client";

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { getCameraTransform } from '@/components/utilities/cameraPath';

interface CinematicCameraProps {
  progress: number;
}

const CinematicCamera: React.FC<CinematicCameraProps> = ({ progress }) => {
  const { camera } = useThree();

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(5, 2, 5),
      new THREE.Vector3(-5, -2, 0),
      new THREE.Vector3(0, 0, -10),
    ]);
  }, []);

  useFrame(() => {
    const { position, lookAt } = getCameraTransform(curve, progress);
    camera.position.lerp(position, 0.1);
    camera.lookAt(lookAt);
  });

  return null;
};

export default CinematicCamera;
