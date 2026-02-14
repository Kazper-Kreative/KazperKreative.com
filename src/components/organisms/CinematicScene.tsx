"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import CinematicCamera from './CinematicCamera';

interface CinematicSceneProps {
  progress: number;
}

import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import CinematicCamera from './CinematicCamera';
import * as THREE from 'three';

interface CinematicSceneProps {
  progress: number;
}

const Monolith = ({ position, color = "#8B5CF6", size = [1, 2, 1], distort = 0 }: any) => (
  <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      {distort > 0 ? (
        <MeshDistortMaterial color={color} speed={distort} distort={0.4} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.5} />
      ) : (
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
      )}
    </mesh>
  </Float>
);

const Particles = ({ count = 1000, progress }: { count?: number; progress: number }) => {
  const mesh = useRef<THREE.Points>(null!);
  const dummy = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.y = time * 0.05 + progress * 2;
    mesh.current.rotation.x = time * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[dummy, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#8B5CF6" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

const CinematicScene: React.FC<CinematicSceneProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 z-0 bg-[#020205]">
      <Suspense fallback={<div className="bg-[#020205] w-full h-full" />}>
        <Canvas shadows camera={{ fov: 75 }}>
          <PerspectiveCamera makeDefault />
          <CinematicCamera progress={progress} />
          
          <ambientLight intensity={0.1} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4B5563" />
          
          <Environment preset="night" />
          <Particles progress={progress} />
          
          {/* Act 1: Foundation - Stable, Solid */}
          <Monolith position={[0, -1, -5]} size={[2, 0.5, 2]} color="#4C1D95" />
          <Monolith position={[-3, 1, -8]} size={[0.5, 4, 0.5]} color="#5B21B6" />
          
          {/* Act 2: Immersion - Distorted, Fluid */}
          <Monolith position={[5, 0, -15]} size={[1, 5, 1]} color="#6D28D9" distort={2} />
          <Monolith position={[-5, 2, -20]} size={[3, 1, 3]} color="#1E1B4B" distort={1} />
          
          {/* Act 3: Precision - Sharp, Geometric */}
          <Monolith position={[0, 0, -30]} size={[10, 0.1, 10]} color="#8B5CF6" />
          <Monolith position={[2, 3, -35]} size={[0.2, 10, 0.2]} color="#A78BFA" />

          {/* Technical Grid Floor */}
          <gridHelper args={[100, 50, "#1F2937", "#111827"]} position={[0, -5, 0]} />
          
          <fog attach="fog" args={["#020205", 5, 40]} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default CinematicScene;
