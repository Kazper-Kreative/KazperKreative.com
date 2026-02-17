"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerformanceConfig } from "@/components/utilities/usePerformanceConfig";
import { AdaptiveDpr, Preload } from "@react-three/drei";

const Particles = () => {
  const { particleCount } = usePerformanceConfig();
  const mesh = useRef<THREE.Points>(null!);

  const dummy = useMemo(() => {
    const count = Math.min(particleCount / 4, 300); // Sharp reduction for hero background
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return positions;
  }, [particleCount]);

  useFrame((state) => {
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[dummy, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#8B5CF6"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

const TechnicalBackground: React.FC<{ isVisible?: boolean }> = ({ isVisible = true }) => {
  const [mounted, setMounted] = React.useState(false);
  const { dpr } = usePerformanceConfig();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isVisible) {
    return <div className="absolute inset-0 z-0 bg-[#09090b] flex items-center justify-center" suppressHydrationWarning>
      {!mounted && <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" suppressHydrationWarning />}
    </div>;
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" suppressHydrationWarning>
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 75 }} 
        gl={{ 
          antialias: false, 
          alpha: true, 
          powerPreference: "high-performance",
          stencil: false,
          depth: false // Further optimization: disable depth if not needed for particles
        }} 
        dpr={dpr}
        onError={(error) => console.error("TechnicalBackground Canvas Error:", error)}
      >
        <color attach="background" args={["#09090b"]} />
        <ambientLight intensity={0.3} />
        <Particles />
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
};

export default TechnicalBackground;
