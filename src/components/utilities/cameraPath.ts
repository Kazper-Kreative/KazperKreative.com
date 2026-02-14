import * as THREE from 'three';

export const getCameraTransform = (curve: THREE.Curve<THREE.Vector3>, progress: number) => {
  const position = curve.getPointAt(progress);
  // For now, look at the next point or a fixed target
  const lookAt = curve.getPointAt(Math.min(progress + 0.01, 1));
  
  return { position, lookAt };
};
