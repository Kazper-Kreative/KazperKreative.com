import React from 'react';
import { AudioProvider } from '@/components/utilities/AudioProvider';
import ScanlineOverlay from '@/components/atoms/ScanlineOverlay';
import GlitchTransition from '@/components/atoms/GlitchTransition';
import CinematicChrome from '@/components/organisms/CinematicChrome';

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <ScanlineOverlay />
      <GlitchTransition />
      <CinematicChrome />
      <div className="cinematic-vignette">{children}</div>
    </AudioProvider>
  );
}
