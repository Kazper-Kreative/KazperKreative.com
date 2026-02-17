"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore } from '@/store/useGamificationStore';
import ClientSafeIcon, { IconName } from '@/components/atoms/ClientSafeIcon';
import { useUISound } from '@/hooks/useUISound';

const BadgeToast: React.FC = () => {
  const lastUnlockedBadgeId = useGamificationStore((state) => state.lastUnlockedBadgeId);
  const badges = useGamificationStore((state) => state.badges);
  const clearLastUnlockedBadge = useGamificationStore((state) => state.clearLastUnlockedBadge);
  const { playSound } = useUISound();

  const badge = badges.find((b) => b.id === lastUnlockedBadgeId);

  useEffect(() => {
    if (lastUnlockedBadgeId) {
      playSound('success');
      const timer = setTimeout(() => {
        clearLastUnlockedBadge();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastUnlockedBadgeId, clearLastUnlockedBadge]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.9, x: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-32 right-4 sm:right-8 z-[100] flex items-start bg-zinc-900/90 border border-purple-500/50 backdrop-blur-md rounded-lg p-4 shadow-2xl shadow-purple-900/20 max-w-[300px] overflow-hidden"
        >
          {/* Animated Glow Border */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-purple-500/10 opacity-50 pointer-events-none" />
          
          <div className="flex-shrink-0 mr-4 p-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
            <ClientSafeIcon name={badge.icon as IconName} className="text-purple-400" size={24} />
          </div>
          <div className="flex-grow">
            <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-1 flex items-center">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 animate-pulse" />
              BADGE_UNLOCKED
            </p>
            <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">{badge.name}</h4>
            <p className="text-zinc-400 text-xs leading-snug">{badge.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeToast;
