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
  specialties?: string[];
}

const AgentCard: React.FC<AgentCardProps> = ({ name, pictureUrl, role, bio, upworkUrl, specialties = [] }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href={upworkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative group bg-zinc-900/40 border border-zinc-800 hover:border-purple-500/50 rounded-xl shadow-2xl overflow-hidden p-8 text-left block h-full transition-all duration-500 backdrop-blur-sm"
      suppressHydrationWarning
    >
      <motion.div
        whileHover={{ y: -10 }}
        className="h-full flex flex-col"
      >
        <div className="relative w-full aspect-square mb-6 rounded-lg overflow-hidden border border-zinc-700 group-hover:border-purple-500/50 transition-colors duration-500" suppressHydrationWarning>
          {mounted && (
            <Image
              src={pictureUrl}
              alt={name}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
        </div>

        <div className="flex-grow" suppressHydrationWarning>
          <p className="text-purple-500 font-mono text-[10px] mb-2 tracking-[0.2em] uppercase">
            // ACTIVE_AGENT
          </p>
          <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight group-hover:text-purple-400 transition-colors duration-300">
            {name}
          </h3>
          <p className="text-zinc-400 text-sm mb-4 font-medium italic">{role}</p>
          <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-3 group-hover:text-zinc-300 transition-colors duration-300">
            {bio}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6" suppressHydrationWarning>
          {specialties.map((specialty, index) => (
            <span
              key={index}
              className="px-2 py-1 text-[10px] bg-zinc-800/50 text-zinc-400 rounded border border-zinc-700 font-mono uppercase tracking-wider group-hover:border-purple-500/30 group-hover:text-purple-300 transition-all duration-300"
            >
              {specialty}
            </span>
          ))}
        </div>
        
        <div className="flex items-center text-zinc-500 group-hover:text-purple-400 transition-colors duration-300 text-xs font-bold uppercase tracking-widest" suppressHydrationWarning>
          View Profile {mounted ? <ArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" size={14} /> : <div className="w-4 h-4 ml-2" />}
        </div>
      </motion.div>
    </Link>
  );
};

export default AgentCard;
