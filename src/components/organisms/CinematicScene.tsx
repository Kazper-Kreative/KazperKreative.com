"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import CinematicCamera from './CinematicCamera';

interface CinematicSceneProps {
  progress: number;
}

const Monolith = ({ position, color = "#8B5CF6", size = [1, 2, 1] }: any) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
  </mesh>
);

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
          
          {/* Act 1: Foundation */}
          <Monolith position={[0, -1, -5]} size={[2, 0.5, 2]} color="#4C1D95" />
          <Monolith position={[-3, 1, -8]} size={[0.5, 4, 0.5]} />
          
          {/* Act 2: Immersion */}
          <Monolith position={[5, 0, -15]} size={[1, 5, 1]} color="#6D28D9" />
          <Monolith position={[-5, 2, -20]} size={[3, 1, 3]} color="#1E1B4B" />
          
          {/* Act 3: Precision */}
          <Monolith position={[0, 0, -30]} size={[10, 0.1, 10]} color="#8B5CF6" />
          <Monolith position={[2, 3, -35]} size={[0.2, 10, 0.2]} />

          {/* Technical Grid Floor */}
          <gridHelper args={[100, 50, "#1F2937", "#111827"]} position={[0, -5, 0]} />
          
          <fog attach="fog" args={["#020205", 5, 40]} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default CinematicScene;
