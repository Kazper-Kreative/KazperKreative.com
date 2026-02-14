"use client";

import React, { useState, useRef } from 'react';
import CinematicScene from './CinematicScene';
import ContentOverlay from './ContentOverlay';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const CinematicLanding: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setProgress(latest);
  });

  // Fade out the intro as we finish the scroll section (0.8 to 1.0)
  const opacity = useTransform(scrollYProgress, [0, 0.8, 0.9], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.8, 1], [1, 1.1]);
  const pointerEvents = useTransform(scrollYProgress, (latest) => latest > 0.9 ? "none" : "auto");

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <motion.div 
        style={{ opacity, scale, pointerEvents: pointerEvents as any }} 
        className="fixed inset-0 z-50 overflow-hidden"
      >
        <CinematicScene progress={progress} />
        <ContentOverlay progress={progress} />
      </motion.div>
    </div>
  );
};

export default CinematicLanding;
