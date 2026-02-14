"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentOverlayProps {
  progress: number;
}

const acts = [
  {
    id: 1,
    range: [0, 0.3],
    title: "Technical Mastery",
    description: "Engineering the foundation of high-performance digital worlds.",
  },
  {
    id: 2,
    range: [0.3, 0.6],
    title: "Cinematic Immersion",
    description: "Blurring the line between reality and digital experiences.",
  },
  {
    id: 3,
    range: [0.6, 0.9],
    title: "Precision Engineering",
    description: "Delivering stable, scalable, and high-fidelity results.",
  },
];

const ContentOverlay: React.FC<ContentOverlayProps> = ({ progress }) => {
  const currentAct = acts.find(act => progress >= act.range[0] && progress < act.range[1]);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {currentAct && (
          <motion.div
            key={currentAct.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl text-center"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter">
              {currentAct.title}
            </h2>
            <p className="text-xl md:text-2xl text-purple-400 font-medium">
              {currentAct.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentOverlay;
