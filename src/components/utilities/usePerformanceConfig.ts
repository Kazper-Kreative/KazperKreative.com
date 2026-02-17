"use client";

import { useState, useEffect } from 'react';

export const usePerformanceConfig = () => {
  const [config, setConfig] = useState({
    reducedMotion: false,
    particleCount: 1000,
    show3D: true,
    dpr: [1, 2] as [number, number],
  });

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateConfig = () => {
      // Basic heuristic for "low end" - can be expanded
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setConfig({
        reducedMotion: reducedMotionQuery.matches,
        particleCount: isMobile ? 500 : 1000,
        show3D: true,
        dpr: isMobile ? [1, 1.5] : [1, 2],
      });
    };

    updateConfig();
    reducedMotionQuery.addEventListener('change', updateConfig);
    
    return () => reducedMotionQuery.removeEventListener('change', updateConfig);
  }, []);

  return config;
};
