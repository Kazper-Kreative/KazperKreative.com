"use client";

import React from 'react';
import AgentCard from '@/components/molecules/AgentCard';
import { motion, Variants } from 'framer-motion';

import { usePerformanceConfig } from '@/components/utilities/usePerformanceConfig';

interface Agent {
  name: string;
  pictureUrl: string;
  role: string;
  bio: string;
  upworkUrl: string;
  specialties?: string[];
}

interface AgentsGridProps {
  agents: Agent[];
}

const getContainerVariants = (reducedMotion: boolean): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: reducedMotion ? 0 : 0.1,
      delayChildren: reducedMotion ? 0 : 0.2,
    },
  },
});

const getItemVariants = (reducedMotion: boolean): Variants => ({
  hidden: { 
    opacity: 0, 
    y: reducedMotion ? 0 : 30
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: {
      duration: reducedMotion ? 0.3 : 0.6,
      ease: "easeOut"
    }
  },
});

const AgentsGrid: React.FC<AgentsGridProps> = ({ agents }) => {
  const [mounted, setMounted] = React.useState(false);
  const { reducedMotion } = usePerformanceConfig();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = getContainerVariants(reducedMotion);
  const itemVariants = getItemVariants(reducedMotion);

  return (
    <section className="container mx-auto px-4 py-24 relative overflow-hidden" suppressHydrationWarning>
      {/* Background Decor - Optimized with will-change */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none will-change-transform" suppressHydrationWarning />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -x-1/2 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none will-change-transform" suppressHydrationWarning />

      <div className="relative z-10 mb-20 text-left max-w-4xl" suppressHydrationWarning>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-purple-500 font-mono text-xs mb-4 tracking-[0.4em] uppercase"
        >
          // OPERATIONAL_UNITS
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter"
        >
          THE ROSTER.
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="h-px w-full bg-gradient-to-r from-purple-500/50 to-transparent mb-8"
        />
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light"
        >
          Meet our elite engineering leads. Specialized in high-performance architectures, 
          cinematic graphics, and automated precision.
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
        suppressHydrationWarning
      >
        {agents.map((agent, index) => (
          <motion.div key={index} variants={itemVariants} suppressHydrationWarning>
            <AgentCard {...agent} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default AgentsGrid;
