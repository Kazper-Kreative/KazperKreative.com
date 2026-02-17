"use client";

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, PresentationControls, AdaptiveDpr } from '@react-three/drei';
import { usePerformanceConfig } from '@/components/utilities/usePerformanceConfig';
import { motion, useInView } from 'framer-motion';

interface CaseStudyInteractiveSceneProps {
  metadata?: string;
}

const CaseStudyInteractiveScene: React.FC<CaseStudyInteractiveSceneProps> = ({ metadata }) => {
  const { reducedMotion, dpr } = usePerformanceConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative aspect-video w-full bg-[#020205] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-purple-900/10" 
      suppressHydrationWarning
    >
      {isInView && (
        <Suspense fallback={null}>
          <Canvas 
            camera={{ position: [0, 0, 4], fov: 50 }} 
            gl={{ 
              antialias: false, 
              alpha: true, 
              powerPreference: "high-performance",
              stencil: false
            }}
            dpr={dpr}
            suppressHydrationWarning
            className="w-full h-full"
          >
            <PerspectiveCamera makeDefault position={[0, 0, 4]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#8B5CF6" />
            
            <Environment preset="night" />

            <PresentationControls
              global
              snap
              rotation={[0, 0.3, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
            >
              <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh>
                  <octahedronGeometry args={[1, 0]} />
                  <meshStandardMaterial color="#8B5CF6" metalness={0.8} roughness={0.2} wireframe />
                </mesh>
                <mesh>
                  <octahedronGeometry args={[0.8, 0]} />
                  <meshStandardMaterial color="#4C1D95" metalness={0.9} roughness={0.1} emissive="#8B5CF6" emissiveIntensity={0.5} />
                </mesh>
              </Float>
            </PresentationControls>
            
            <AdaptiveDpr pixelated />
          </Canvas>
        </Suspense>
      )}
      
      <div className="absolute bottom-4 left-4 pointer-events-none z-20" suppressHydrationWarning>
        <p className="text-purple-500 font-mono text-[10px] tracking-[0.2em] uppercase" suppressHydrationWarning>
          // INTERACTIVE_UNIT_01 :: DRAG_TO_ROTATE
        </p>
      </div>
    </motion.div>
  );
};

export default CaseStudyInteractiveScene;
