"use client";

import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/organisms/HeroSection';
import GhostScan from '@/components/organisms/GhostScan';
import CinematicLanding from '@/components/organisms/CinematicLanding';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useUserRole } from '@/hooks/useUserRole';

export default function HomeHero() {
  const [showHero3D, setShowHero3D] = useState(false);
  const [showCinematic3D, setShowCinematic3D] = useState(true);
  const [needsScan, setNeedsScan] = useState(false);
  const { role } = useUserRole();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasScanned = localStorage.getItem('kazper-ghost-scanned');
    if (!hasScanned && role === 'GUEST') {
      setNeedsScan(true);
    }
  }, [role]);

  const handleScanComplete = () => {
    setNeedsScan(false);
    localStorage.setItem('kazper-ghost-scanned', 'true');
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Cinematic intro spans ~400vh; Hero 3D fades in as Cinematic fades out.
    setShowHero3D(latest > 0.3);
    setShowCinematic3D(latest <= 0.6);
  });

  return (
    <>
      {needsScan && <GhostScan onComplete={handleScanComplete} />}
      <CinematicLanding isVisible={showCinematic3D} />
      <HeroSection isVisible={showHero3D} />
    </>
  );
}
