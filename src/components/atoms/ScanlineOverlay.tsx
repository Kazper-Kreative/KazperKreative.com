"use client";

import React from 'react';
import { usePerformanceConfig } from '@/components/utilities/usePerformanceConfig';

export default function ScanlineOverlay() {
  const { reducedMotion } = usePerformanceConfig();

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[200]"
      style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        mixBlendMode: 'multiply',
      }}
    />
  );
}
