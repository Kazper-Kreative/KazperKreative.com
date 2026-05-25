"use client";

import React from 'react';
import Link from 'next/link';
import CinematicLanding from '@/components/organisms/CinematicLanding';
import { usePerformanceConfig } from '@/components/utilities/usePerformanceConfig';

export default function ExperiencePage() {
  const { reducedMotion } = usePerformanceConfig();

  if (reducedMotion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">
            The experience.
          </h1>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            This page is normally a scroll-driven cinematic intro. We&apos;ve
            disabled it because your system requests reduced motion.
          </p>
          <Link
            href="/"
            className="inline-block text-purple-400 hover:text-purple-300 border border-purple-500/50 px-6 py-3 hover:bg-purple-500/10 transition-colors text-sm rounded"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return <CinematicLanding />;
}
