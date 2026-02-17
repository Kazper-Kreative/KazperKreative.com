"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/atoms/Button';
import Link from 'next/link';
import { useUISound } from '@/hooks/useUISound';
import { useGamificationStore } from '@/store/useGamificationStore';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';

const QuickActions: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { playSound } = useUISound();
  const unlockBadge = useGamificationStore((state) => state.unlockBadge);

  useEffect(() => {
    const handleScroll = () => {
      // Show after initial scroll
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-8 left-1/2 z-[90] flex items-center p-1.5 bg-zinc-900/80 backdrop-blur-xl border border-purple-500/20 rounded-full shadow-2xl shadow-purple-900/20"
        >
          <div className="flex items-center space-x-2 px-2">
            <Link 
              href="https://calendly.com/kazperkreative" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => playSound('click')}
              onMouseEnter={() => playSound('hover')}
            >
              <Button variant="primary" size="sm" className="rounded-full !px-6 !h-9 text-[10px] uppercase tracking-wider font-bold">
                Book Discovery
              </Button>
            </Link>
            
            <div className="w-px h-4 bg-zinc-800" />

            <Link 
              href="/agents/join"
              onClick={() => {
                playSound('click');
                unlockBadge('recruit');
              }}
              onMouseEnter={() => playSound('hover')}
            >
              <Button variant="secondary" size="sm" className="rounded-full !px-6 !h-9 text-[10px] uppercase tracking-wider font-bold">
                Apply to Join
              </Button>
            </Link>
          </div>

          {/* Technical Detail */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
             <span className="text-[8px] font-mono text-purple-500/40 uppercase tracking-[0.4em] animate-pulse">
               // RAPID_DEPLOYMENT_INTERFACE
             </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickActions;
