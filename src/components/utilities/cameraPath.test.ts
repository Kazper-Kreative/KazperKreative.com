import * as THREE from 'three';
import { getCameraTransform } from './cameraPath';

describe('cameraPath utilities', () => {
  const points = [
    new THREE.Vector3(0, 0, 5),
    new THREE.Vector3(0, 2, 10),
    new THREE.Vector3(5, 0, 15),
  ];
  const curve = new THREE.CatmullRomCurve3(points);

  it('returns the starting position at progress 0', () => {
    const { position } = getCameraTransform(curve, 0);
    expect(position.x).toBeCloseTo(0);
    expect(position.y).toBeCloseTo(0);
    expect(position.z).toBeCloseTo(5);
  });

  it('returns the ending position at progress 1', () => {
    const { position } = getCameraTransform(curve, 1);
    expect(position.x).toBeCloseTo(5);
    expect(position.y).toBeCloseTo(0);
    expect(position.z).toBeCloseTo(15);
  });

  it('returns a middle position at progress 0.5', () => {
    const { position } = getCameraTransform(curve, 0.5);
    // Rough estimate for midpoint of CatmullRom
    expect(position.z).toBeGreaterThan(5);
    expect(position.z).toBeLessThan(15);
  });
});
