"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AdaptiveDpr } from "@react-three/drei";
import { usePerformanceConfig } from "@/components/utilities/usePerformanceConfig";
import { useUserRole } from "@/hooks/useUserRole";

const Particles = ({ color }: { color: string }) => {
  const mesh = useRef<THREE.Points>(null!);
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i] = (Math.random() - 0.5) * 10;
      pos[i + 1] = (Math.random() - 0.5) * 10;
      pos[i + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

interface TechnicalBackgroundProps {
  isVisible?: boolean;
}

const TechnicalBackground: React.FC<TechnicalBackgroundProps> = ({ isVisible = true }) => {
  const [mounted, setMounted] = useState(false);
  const { dpr } = usePerformanceConfig();
  const { role } = useUserRole();
  const { getThemeColor } = useUserRole();
  const themeColor = getThemeColor();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isVisible) {
    return (
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        {!mounted && (
          <div 
            className="w-6 h-6 border-2 rounded-full animate-spin" 
            style={{ borderColor: `${themeColor}30`, borderTopColor: themeColor }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <Canvas 
        dpr={dpr}
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: false, alpha: true }}
      >
        <color attach="background" args={["#000000"]} />
        <Particles color={themeColor} />
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
};

export default TechnicalBackground;
