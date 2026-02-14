"use client";

import { useState, useEffect } from 'react';

export const usePerformanceConfig = () => {
  const [config, setConfig] = useState({
    reducedMotion: false,
    particleCount: 1000,
    show3D: true,
  });

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateConfig = () => {
      // Basic heuristic for "low end" - can be expanded
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setConfig({
        reducedMotion: reducedMotionQuery.matches,
        particleCount: isMobile ? 500 : 1000,
        show3D: true, // We could set to false on very low end if needed
      });
    };

    updateConfig();
    reducedMotionQuery.addEventListener('change', updateConfig);
    
    return () => reducedMotionQuery.removeEventListener('change', updateConfig);
  }, []);

  return config;
};
