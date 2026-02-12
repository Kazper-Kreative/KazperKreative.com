"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface AgentCardProps {
  name: string;
  pictureUrl: string;
  role: string;
  bio: string;
  upworkUrl: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, pictureUrl, role, bio, upworkUrl }) => {
  return (
    <Link href={upworkUrl} passHref>
      <motion.a
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)" }}
        className="relative group bg-zinc-900/70 border border-purple-500/30 rounded-lg shadow-xl overflow-hidden p-6 text-center block h-full"
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
        <p className="text-zinc-400 text-base">{bio}</p>
        
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="text-white" size={24} />
        </div>
      </motion.a>
    </Link>
  );
};

export default AgentCard;
