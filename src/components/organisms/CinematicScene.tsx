"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';

interface CinematicSceneProps {
  progress: number;
}

const CinematicScene: React.FC<CinematicSceneProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Suspense fallback={<div className="bg-black w-full h-full" />}>
        <Canvas shadowMap>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          
          <Environment preset="night" />
          
          {/* We will add more actors and content here in next tasks */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#8B5CF6" />
          </mesh>
        </Canvas>
      </Suspense>
    </div>
  );
};

export default CinematicScene;
