"use client";

import React, { useState, useEffect } from 'react';
import HUD from './HUD';
import CommandPalette from './CommandPalette';
import QuickActions from './QuickActions';
import GhostScan from './GhostScan';
import IdentityBadge from '@/components/atoms/IdentityBadge';
import { useUserRole } from '@/hooks/useUserRole';

/**
 * Cinematic overlay stack — only mounted on /experience.
 * Renders HUD, CommandPalette, QuickActions, the GhostScan onboarding
 * intro (once per visitor), and a floating IdentityBadge.
 */
export default function CinematicChrome() {
  const [needsScan, setNeedsScan] = useState(false);
  const { role } = useUserRole();

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

  return (
    <>
      {needsScan && <GhostScan onComplete={handleScanComplete} />}
      <HUD />
      <CommandPalette />
      <QuickActions />
      <div className="fixed top-4 right-4 z-[110] hidden md:block">
        <IdentityBadge />
      </div>
    </>
  );
}
