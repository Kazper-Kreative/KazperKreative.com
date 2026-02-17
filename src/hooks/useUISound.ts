"use client";

import { useCallback } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import { audioCore } from '@/components/utilities/AudioProvider';

export const useUISound = () => {
  const isMuted = useGamificationStore((state) => state.isMuted);

  const playSound = useCallback(async (type: 'hover' | 'click' | 'success' | 'levelUp') => {
    if (isMuted) return;

    const ctx = audioCore.getContext();
    if (!ctx) return;

    // Ensure running state
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    if (ctx.state !== 'running') return;

    const now = ctx.currentTime;

    const createMetallicTone = (freq: number, startTime: number, duration: number, volume: number) => {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(freq, startTime);
      gain1.gain.setValueAtTime(volume, startTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle'; 
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(freq * 2.71, startTime); 
      gain2.gain.setValueAtTime(volume * 0.3, startTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.8);
      
      osc1.start(startTime);
      osc1.stop(startTime + duration);
      osc2.start(startTime);
      osc2.stop(startTime + duration);
    };

    switch (type) {
      case 'hover':
        createMetallicTone(1600, now, 0.04, 0.003);
        break;
      case 'click':
        createMetallicTone(600, now, 0.06, 0.008);
        break;
      case 'success':
        createMetallicTone(1200, now, 0.15, 0.006);
        createMetallicTone(1800, now + 0.05, 0.15, 0.004);
        break;
      case 'levelUp':
        [1000, 1400, 1800, 2200].forEach((f, i) => {
          createMetallicTone(f, now + i * 0.06, 0.3, 0.004);
        });
        break;
    }
  }, [isMuted]);

  return { playSound };
};
