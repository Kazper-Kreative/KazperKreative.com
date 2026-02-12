"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';

interface AgentCardProps {
  name: string;
  pictureUrl: string;
  role: string;
  bio: string;
  upworkUrl: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, pictureUrl, role, bio, upworkUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group bg-zinc-900/70 border border-purple-500/30 rounded-lg shadow-xl overflow-hidden p-6 text-center"
    >
      <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-purple-400 group-hover:border-purple-600 transition-colors duration-300">
        <Image
          src={pictureUrl}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
      <p className="text-purple-300 text-sm mb-3">{role}</p>
      <p className="text-zinc-400 text-base mb-6">{bio}</p>
      <Button
        variant="secondary"
        size="md"
        onClick={() => window.open(upworkUrl, '_blank')}
        className="w-full"
      >
        View Upwork Profile
      </Button>
    </motion.div>
  );
};

export default AgentCard;
