"use client";

import React, { useRef } from 'react';
import AgentCard from '@/components/molecules/AgentCard';
import { motion, Variants, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePerformanceConfig } from '@/components/utilities/usePerformanceConfig';

const TechnicalBackground = dynamic(() => import('@/components/atoms/TechnicalBackground'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
});

export interface Agent {
  name: string;
  pictureUrl: string;
  role: string;
  bio: string;
  upworkUrl: string;
  specialties?: string[];
  xp?: number;
  rank?: string;
  status?: string;
}

interface SquadRosterProps {
  agents: Agent[];
}

const getContainerVariants = (reducedMotion: boolean): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: reducedMotion ? 0 : 0.05,
      delayChildren: reducedMotion ? 0 : 0.1,
    },
  },
});

const getItemVariants = (reducedMotion: boolean): Variants => ({
  hidden: { 
    opacity: 0, 
    y: reducedMotion ? 0 : 20
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: {
      duration: reducedMotion ? 0.3 : 0.5,
      ease: "easeOut"
    }
  },
});

const SquadRoster: React.FC<SquadRosterProps> = ({ agents = [] }) => {
  const { reducedMotion } = usePerformanceConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  // Sort by XP descending for a leaderboard feel
  const sortedAgents = [...agents].sort((a, b) => (b.xp || 0) - (a.xp || 0));

  const containerVariants = getContainerVariants(reducedMotion);
  const itemVariants = getItemVariants(reducedMotion);

  return (
    <section ref={containerRef} className="container mx-auto px-4 py-24 relative overflow-hidden" suppressHydrationWarning>
      {isInView && <TechnicalBackground isVisible={true} />}
      
      <div className="relative z-10 mb-20 text-left max-w-4xl" suppressHydrationWarning>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="text-purple-500 font-mono text-xs mb-4 tracking-[0.4em] uppercase"
          suppressHydrationWarning
        >
          // SQUAD_ROSTER_ACCESS_GRANTED
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter"
          suppressHydrationWarning
        >
          THE ROSTER.
        </motion.h2>
        <div className="h-px w-full bg-gradient-to-r from-purple-500/30 to-transparent mb-8" suppressHydrationWarning />
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light"
          suppressHydrationWarning
        >
          High-performance tactical units assigned to deployment operations. 
          Ranks determined by successful missions and agency impact.
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 relative z-10"
        suppressHydrationWarning
      >
        {sortedAgents.map((agent, index) => (
          <motion.div key={index} variants={itemVariants} suppressHydrationWarning>
            <AgentCard {...agent} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default SquadRoster;
