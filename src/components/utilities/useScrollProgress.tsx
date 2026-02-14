"use client";

import { useState, useEffect } from 'react';

export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const innerHeight = window.innerHeight;
      const maxScroll = scrollHeight - innerHeight;
      
      if (maxScroll <= 0) {
        setProgress(0);
      } else {
        const currentProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
        setProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial call
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
};
