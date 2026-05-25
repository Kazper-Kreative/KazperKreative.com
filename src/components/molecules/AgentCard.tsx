"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';
import { useUISound } from '@/hooks/useUISound';
import { useGamificationStore } from '@/store/useGamificationStore';
import AgentDossier from './AgentDossier';

import { usePerformanceConfig } from '@/components/utilities/usePerformanceConfig';

interface AgentCardProps {
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

const AgentCard: React.FC<AgentCardProps> = ({ name, pictureUrl, role, bio, upworkUrl, specialties = [], xp, rank, status }) => {
  const [mounted, setMounted] = React.useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const { reducedMotion } = usePerformanceConfig();
  const { playSound } = useUISound();
  const unlockBadge = useGamificationStore((state) => state.unlockBadge);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    playSound('click');
    setIsDossierOpen(true);
    unlockBadge('networker');
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`View profile for ${name}`}
        onMouseEnter={() => playSound('hover')}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
        className="relative group bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/50 rounded-xl shadow-2xl overflow-hidden p-8 text-left block h-full transition-all duration-500 cursor-pointer"
      >
        <motion.div
          whileHover={reducedMotion ? {} : { y: -10 }}
          className="h-full flex flex-col will-change-transform"
        >
          <div className="relative w-full aspect-square mb-6 rounded-lg overflow-hidden border border-zinc-700 group-hover:border-purple-500/50 transition-colors duration-500">
            {mounted && (
              <Image
                src={pictureUrl}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className={`transition-transform duration-700 will-change-transform ${reducedMotion ? '' : 'group-hover:scale-105'}`}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
          </div>

          <div className="flex-grow">
            <h3 className="text-2xl font-black text-white mb-1 tracking-tight transition-colors duration-300 group-hover:text-purple-400">
              {name}
            </h3>
            <p className="text-zinc-400 text-sm mb-4 font-medium italic">{role}</p>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-3 transition-colors duration-300 group-hover:text-zinc-300">
              {bio}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-zinc-800/50 text-zinc-400 rounded border border-zinc-700 transition-all duration-300 group-hover:border-purple-500/30 group-hover:text-purple-300"
              >
                {specialty}
              </span>
            ))}
          </div>

          <div className="flex items-center text-zinc-500 group-hover:text-purple-400 transition-colors duration-300 text-xs font-bold uppercase tracking-widest">
            View profile <ClientSafeIcon name="ArrowRight" className="ml-2 transform group-hover:translate-x-1 transition-transform" size={14} />
          </div>
        </motion.div>
      </div>

      <AgentDossier
        agent={{ name, pictureUrl, role, bio, upworkUrl, specialties, xp, rank, status }}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </>
  );
};

export default AgentCard;
