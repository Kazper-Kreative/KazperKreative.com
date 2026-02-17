"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';
import { useGamificationStore } from '@/store/useGamificationStore';
import BadgeToast from '@/components/molecules/BadgeToast';
import { useUISound } from '@/hooks/useUISound';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';

const AnimatedNumber = ({ value }: { value: MotionValue<number> | number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Update if value is a number
  useEffect(() => {
    if (typeof value === 'number') {
      setDisplayValue(Math.round(value));
    }
  }, [value]);

  // Update if value is a MotionValue
  useMotionValueEvent(typeof value === 'object' ? value : (null as any), "change", (latest) => {
    setDisplayValue(Math.round(latest as number));
  });

  return <>{displayValue}</>;
};

const HUD: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState<string>('DETECTING...');
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // Fetch user location
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city && data.region_code) {
          setLocation(`${data.city.toUpperCase()}, ${data.region_code}`);
        } else {
          setLocation('ONTARIO, CA');
        }
      })
      .catch(() => setLocation('ONTARIO, CA'));
  }, []);

  // Gamification Store
  const xp = useGamificationStore((state) => state.xp);
  const level = useGamificationStore((state) => state.level);
  const unlockBadge = useGamificationStore((state) => state.unlockBadge);
  const addXP = useGamificationStore((state) => state.addXP);
  const isMuted = useGamificationStore((state) => state.isMuted);
  const isAudioInitialized = useGamificationStore((state) => state.isAudioInitialized);
  const toggleSound = useGamificationStore((state) => state.toggleSound);
  const { playSound } = useUISound();  
    const scaleX = useSpring(scrollYProgress, {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001
    });
  
    const scrollPercentage = useTransform(scrollYProgress, (latest) => latest * 100);
    const verticalProgressBarHeight = useTransform(scrollYProgress, (v) => `${v * 100}%`);
  
    useEffect(() => {
      if (mounted && level > 1) {
        playSound('levelUp');
      }
    }, [level, playSound, mounted]);
  
    useEffect(() => {
      setMounted(true);
      const timer = setInterval(() => {
        const now = new Date();
        setTime(now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        
        // Passive XP Gain (every 30s)
        if (now.getSeconds() % 30 === 0) {
          addXP(5);
        }
      }, 1000);
  
      return () => clearInterval(timer);
    }, [addXP]);
  
    // Scroll Depth Achievement
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
      if (latest > 0.95) {
        unlockBadge('deep_dive');
      }
    });
  
    if (!mounted) return null;
  
    return (
      <>
        <BadgeToast />
        
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden" suppressHydrationWarning>
          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-purple-500/30" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-purple-500/30" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-purple-500/30" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-purple-500/30" />
  
                          {/* Top Left: Status */}
  
                          <div className="absolute top-12 left-12 flex flex-col space-y-1 font-mono text-[10px] text-purple-400">
  
                            <span className="animate-pulse text-purple-400">
  
                              ● SYSTEM_READY
  
                            </span>
  
                            <span className={`${isAudioInitialized ? 'text-purple-400/70' : 'text-zinc-600 animate-pulse'}`}>
                              ATMOSPHERE: {isAudioInitialized ? 'ONLINE' : 'OFFLINE'}
                            </span>
                            <span className="text-zinc-500 opacity-70 hidden sm:inline text-[8px]">ENCRYPTION: AES-256</span>
  
                          </div>              {/* Top Right: System Time */}
              <div className="absolute top-12 right-12 font-mono text-[10px] text-zinc-500 text-right">
                <div>SYSTEM_TIME: {time}</div>
                <div className="text-purple-500/50 uppercase">LOCAL_NODE: {location}</div>
              </div>
        
              {/* Side Progress Bar (Vertical) */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-px h-32 bg-zinc-800 will-change-transform hidden sm:block">
                <motion.div 
                  className="w-full bg-purple-500 will-change-[height]" 
                  style={{ height: verticalProgressBarHeight }} 
                />
                <div className="absolute -left-2 top-0 text-[8px] font-mono text-zinc-600 origin-right -rotate-90 translate-y-[-100%]">00</div>
                <div className="absolute -left-2 bottom-0 text-[8px] font-mono text-zinc-600 origin-right -rotate-90 translate-y-[100%]">100</div>
              </div>
        
              {/* Bottom Left: Scroll Depth */}
              <div className="absolute bottom-12 left-12 font-mono text-[10px] text-zinc-500 will-change-transform">
                <div className="flex items-center space-x-2">
                  <span>SCROLL_DEPTH:</span>
                  <span className="text-purple-400 font-bold"><AnimatedNumber value={scrollPercentage} />%</span>
                </div>
                <div className="text-zinc-700 hidden sm:block">COORD_X: 43.6532 | COORD_Y: -79.3832</div>
              </div>
        
              {/* Bottom Right: XP & Level */}
              <div className="absolute bottom-12 right-12 font-mono text-[10px] text-zinc-500 text-right flex flex-col items-end space-y-2 pointer-events-auto">          <div className="flex items-center space-x-4">
            <button 
              onClick={() => toggleSound()} 
              className="p-1.5 bg-zinc-900 border border-zinc-800 rounded hover:border-purple-500/50 transition-all text-zinc-400 hover:text-purple-400"
              title={isMuted ? "Unmute Systems" : "Mute Systems"}
            >
              <ClientSafeIcon name={isMuted ? "VolumeX" : "Volume2"} size={14} />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-purple-400 font-bold">LVL {level}</span>
              <span className="text-zinc-600">|</span>
              <span>XP: {Math.floor(xp)}</span>
            </div>
          </div>
          {/* XP Bar */}
          <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-purple-500"
               initial={{ width: 0 }}
               animate={{ width: `${(xp % 1000) / 10}%` }}
               transition={{ type: "spring", stiffness: 50 }}
             />
          </div>
        </div>

        {/* Top Center: Progress Bar (Horizontal) */}
        <motion.div 
          className="fixed top-0 left-0 right-0 h-[1px] bg-purple-600 origin-left z-[70] will-change-transform"
          style={{ scaleX }}
        />

        {/* Visual Glitch Elements (Subtle) - Desktop Only */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 right-4 w-px h-16 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent hidden sm:block" 
        />
      </div>
    </>
  );
};

export default HUD;
