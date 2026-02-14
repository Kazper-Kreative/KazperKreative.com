"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface CaseStudyHeaderProps {
  title: string;
  category: string;
  description: string;
}

const CaseStudyHeader: React.FC<CaseStudyHeaderProps> = ({ title, category, description }) => {
  return (
    <div className="relative py-24 px-4 overflow-hidden" suppressHydrationWarning>
      <div className="container mx-auto max-w-5xl relative z-10" suppressHydrationWarning>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-purple-500 font-mono text-sm mb-4 tracking-[0.4em] uppercase"
          suppressHydrationWarning
        >
          // PROJECT_SPEC :: {category}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-black text-white mb-8 uppercase tracking-tighter"
          suppressHydrationWarning
        >
          {title}
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="h-px w-full bg-gradient-to-r from-purple-500/50 to-transparent mb-12 origin-left"
          suppressHydrationWarning
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-zinc-400 text-xl md:text-2xl max-w-3xl leading-relaxed font-light"
          suppressHydrationWarning
        >
          {description}
        </motion.p>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" suppressHydrationWarning />
    </div>
  );
};

export default CaseStudyHeader;
