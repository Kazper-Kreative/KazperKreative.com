"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentOverlayProps {
  progress: number;
  reducedMotion?: boolean;
}

const acts = [
  {
    id: 1,
    range: [0.05, 0.25],
    title: "Technical Mastery",
    subtitle: "STRIKE TEAM ALPHA",
    description: "Engineering the foundation of high-performance digital worlds.",
  },
  {
    id: 2,
    range: [0.35, 0.55],
    title: "Cinematic Immersion",
    subtitle: "VISUAL OVERRIDE",
    description: "Blurring the line between reality and digital experiences.",
  },
  {
    id: 3,
    range: [0.65, 0.85],
    title: "Precision Engineering",
    subtitle: "DATA VALIDATION",
    description: "Delivering stable, scalable, and high-fidelity results.",
  },
];

const ContentOverlay: React.FC<ContentOverlayProps> = ({ progress, reducedMotion = false }) => {
  const currentAct = acts.find(act => progress >= act.range[0] && progress < act.range[1]);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-start p-8 md:p-24">
      <AnimatePresence mode="wait">
        {currentAct && (
          <motion.div
            key={currentAct.id}
            initial={{ opacity: 0, x: reducedMotion ? 0 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reducedMotion ? 0 : 20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-purple-500 font-mono text-sm mb-2 tracking-[0.3em] uppercase"
            >
              // {currentAct.subtitle}
            </motion.p>
            <h2 className="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tight leading-none">
              {currentAct.title.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h2>
            <div className="h-1 w-24 bg-purple-600 mb-6" />
            <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-xl leading-relaxed">
              {currentAct.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentOverlay;
