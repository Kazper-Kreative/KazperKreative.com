"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useScroll } from 'framer-motion';

// Global singleton to surivive re-renders and component unmounts
let ambientContext: AudioContext | null = null;
let mainGain: GainNode | null = null;
let lowOsc: OscillatorNode | null = null;
let midOsc: OscillatorNode | null = null;

export const AmbientAudio: React.FC = () => {
  const isMuted = useGamificationStore((state) => state.isMuted);
  const { scrollYProgress } = useScroll();
  const mountedRef = useRef(false);

  const stopAmbient = useCallback(() => {
    if (mainGain) {
      mainGain.gain.exponentialRampToValueAtTime(0.0001, ambientContext!.currentTime + 1);
    }
  }, []);

  const startAmbient = useCallback(() => {
    if (typeof window === 'undefined' || isMuted) return;

    if (!ambientContext) {
      ambientContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (ambientContext.state === 'suspended') {
      ambientContext.resume();
    }

    if (!mainGain) {
      mainGain = ambientContext.createGain();
      mainGain.connect(ambientContext.destination);
      mainGain.gain.setValueAtTime(0.0001, ambientContext.currentTime);
    }

    // Fade in the ambient layer - Reduced for extreme subtlety
    mainGain.gain.exponentialRampToValueAtTime(0.008, ambientContext.currentTime + 2);

    if (!lowOsc) {
      lowOsc = ambientContext.createOscillator();
      const lowGain = ambientContext.createGain();
      lowOsc.type = 'sine';
      lowOsc.frequency.setValueAtTime(55, ambientContext.currentTime); // A1
      lowGain.gain.setValueAtTime(0.4, ambientContext.currentTime);
      lowOsc.connect(lowGain);
      lowGain.connect(mainGain);
      lowOsc.start();
    }

    if (!midOsc) {
      midOsc = ambientContext.createOscillator();
      const midGain = ambientContext.createGain();
      midOsc.type = 'triangle';
      midOsc.frequency.setValueAtTime(110, ambientContext.currentTime); // A2
      midGain.gain.setValueAtTime(0.08, ambientContext.currentTime);
      midOsc.connect(midGain);
      midGain.connect(mainGain);
      midOsc.start();
    }
  }, [isMuted]);

  useEffect(() => {
    mountedRef.current = true;
    
    const handleFirstInteraction = () => {
      startAmbient();
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('mousemove', handleFirstInteraction);
    };

    if (!isMuted) {
      window.addEventListener('mousedown', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);
      window.addEventListener('scroll', handleFirstInteraction);
      window.addEventListener('mousemove', handleFirstInteraction);
    }

    return () => {
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('mousemove', handleFirstInteraction);
    };
  }, [isMuted, startAmbient]);

  // Handle Mute changes
  useEffect(() => {
    if (isMuted) {
      stopAmbient();
    } else if (ambientContext && ambientContext.state !== 'suspended') {
      startAmbient();
    }
  }, [isMuted, stopAmbient, startAmbient]);

  // Dynamic Ambient Shifting based on scroll
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (ambientContext && lowOsc && midOsc) {
        // Subtly shift frequencies as user scrolls
        const now = ambientContext.currentTime;
        lowOsc.frequency.setTargetAtTime(55 + (latest * 5), now, 0.5);
        midOsc.frequency.setTargetAtTime(110 + (latest * 10), now, 0.5);
      }
    });
  }, [scrollYProgress]);

  return null;
};

export default AmbientAudio;
