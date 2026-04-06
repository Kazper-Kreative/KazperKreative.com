"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceConfig } from '@/components/utilities/usePerformanceConfig';

export default function GlitchTransition() {
  const pathname = usePathname();
  const [showGlitch, setShowGlitch] = useState(false);
  const { reducedMotion } = usePerformanceConfig();

  useEffect(() => {
    if (reducedMotion) return;
    setShowGlitch(true);
    const timer = setTimeout(() => setShowGlitch(false), 300);
    return () => clearTimeout(timer);
  }, [pathname, reducedMotion]);

  return (
    <AnimatePresence>
      {showGlitch && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.8, 1, 0.6, 1] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[250]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.05) 50%, transparent 100%)',
            backdropFilter: 'hue-rotate(10deg)',
          }}
        >
          {/* Glitch bars */}
          <div className="absolute top-[20%] left-0 right-0 h-[2px] bg-purple-500/20" />
          <div className="absolute top-[45%] left-0 right-0 h-[1px] bg-cyan-500/15" />
          <div className="absolute top-[73%] left-0 right-0 h-[3px] bg-purple-500/10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
