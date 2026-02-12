"use client";

import React from 'react';
import AgentCard from '@/components/molecules/AgentCard';
import { motion } from 'framer-motion';

interface Agent {
  name: string;
  pictureUrl: string;
  role: string;
  bio: string;
  upworkUrl: string;
}

interface AgentsGridProps {
  agents: Agent[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const AgentsGrid: React.FC<AgentsGridProps> = ({ agents }) => {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-12">Our Agents</h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {agents.map((agent, index) => (
          <motion.div key={index} variants={itemVariants}>
            <AgentCard {...agent} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default AgentsGrid;
