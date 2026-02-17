"use client";

import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, MeshDistortMaterial, AdaptiveDpr, Preload } from '@react-three/drei';
import CinematicCamera from './CinematicCamera';
import * as THREE from 'three';
import { usePerformanceConfig } from '@/components/utilities/usePerformanceConfig';

interface CinematicSceneProps {
  progress: number;
  reducedMotion?: boolean;
}

const Monolith = ({ position, color = "#8B5CF6", size = [1, 2, 1], reducedMotion = false }: any) => (
  <Float speed={reducedMotion ? 0 : 1} rotationIntensity={reducedMotion ? 0 : 0.3} floatIntensity={reducedMotion ? 0 : 0.3}>
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.9} 
        roughness={0.1} 
        emissive={color} 
        emissiveIntensity={0.5} 
      />
    </mesh>
  </Float>
);

const Particles = ({ progress, reducedMotion = false }: { progress: number; reducedMotion?: boolean }) => {
  const { particleCount } = usePerformanceConfig();
  const mesh = useRef<THREE.Points>(null!);
  const dummy = useMemo(() => {
    const count = Math.min(particleCount, 500); // Capped for performance
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, [particleCount]);

  useFrame((state) => {
    if (reducedMotion) return;
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.03 + progress * 1.5;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[dummy, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#8B5CF6" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
};

const CinematicScene: React.FC<CinematicSceneProps> = ({ progress, reducedMotion = false }) => {
  const { dpr } = usePerformanceConfig();

  return (
    <div className="fixed inset-0 z-0 bg-[#020205] overflow-hidden" suppressHydrationWarning>
      <Suspense fallback={<div className="bg-[#020205] w-full h-full flex items-center justify-center" suppressHydrationWarning><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" suppressHydrationWarning /></div>}>
        <Canvas 
          camera={{ fov: 75 }} 
          gl={{ 
            antialias: false, // Performance boost
            alpha: true, 
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }} 
          dpr={dpr}
          suppressHydrationWarning
          onError={(error) => console.error("Three.js Canvas Error:", error)}
        >
          <color attach="background" args={["#020205"]} />
          <PerspectiveCamera makeDefault />
          <CinematicCamera progress={progress} reducedMotion={reducedMotion} />
          
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#8B5CF6" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4C1D95" />
          
          <Particles progress={progress} reducedMotion={reducedMotion} />
          
          {/* Act 1: Foundation - Stable, Solid */}
          <Monolith position={[0, -1, -5]} size={[2, 0.5, 2]} color="#4C1D95" reducedMotion={reducedMotion} />
          <Monolith position={[-3, 1, -8]} size={[0.5, 4, 0.5]} color="#5B21B6" reducedMotion={reducedMotion} />
          
          {/* Act 2: Immersion - Distorted, Fluid */}
          <Monolith position={[5, 0, -15]} size={[1, 5, 1]} color="#6D28D9" distort={2} reducedMotion={reducedMotion} />
          <Monolith position={[-5, 2, -20]} size={[3, 1, 3]} color="#1E1B4B" distort={1} reducedMotion={reducedMotion} />
          
          {/* Act 3: Precision - Sharp, Geometric */}
          <Monolith position={[0, 0, -30]} size={[10, 0.1, 10]} color="#8B5CF6" reducedMotion={reducedMotion} />
          <Monolith position={[2, 3, -35]} size={[0.2, 10, 0.2]} color="#A78BFA" reducedMotion={reducedMotion} />

          {/* Technical Grid Floor */}
          <gridHelper args={[100, 50, "#1F2937", "#111827"]} position={[0, -5, 0]} />
          
          <fog attach="fog" args={["#020205", 5, 40]} />
          
          <AdaptiveDpr pixelated />
          <Preload all />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default CinematicScene;
