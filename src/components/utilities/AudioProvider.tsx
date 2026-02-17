"use client";

import React, { useEffect, useCallback, useRef } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useScroll } from 'framer-motion';

class AudioCore {
  context: AudioContext | null = null;
  mainGain: GainNode | null = null;
  filter: BiquadFilterNode | null = null;
  droneStarted = false;

  getContext() {
    if (typeof window === 'undefined') return null;
    if (!this.context) {
      const ContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (ContextClass) {
        this.context = new ContextClass();
      }
    }
    return this.context;
  }

  async resume() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.error("Audio resume failed", e);
      }
    }
    return ctx?.state === 'running';
  }

  initDrone() {
    const ctx = this.getContext();
    if (!ctx || this.droneStarted || ctx.state !== 'running') return;

    this.mainGain = ctx.createGain();
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(400, ctx.currentTime);

    this.mainGain.connect(this.filter);
    this.filter.connect(ctx.destination);
    this.mainGain.gain.setValueAtTime(0.0001, ctx.currentTime);

    const frequencies = [55, 110, 164.81, 220, 277.18];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);
      g.gain.setValueAtTime(0.05 / frequencies.length, ctx.currentTime);
      osc.connect(g);
      g.connect(this.mainGain!);
      osc.start();
    });

    this.droneStarted = true;
  }

  setMuted(muted: boolean) {
    if (!this.mainGain || !this.context) return;
    const target = muted ? 0.0001 : 0.01;
    this.mainGain.gain.setTargetAtTime(target, this.context.currentTime, 0.5);
  }

  updatePitch(latest: number) {
    if (!this.filter || !this.context) return;
    const now = this.context.currentTime;
    this.filter.frequency.setTargetAtTime(400 + (latest * 1000), now, 0.5);
  }
}

export const audioCore = new AudioCore();

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMuted = useGamificationStore((state) => state.isMuted);
  const setAudioInitialized = useGamificationStore((state) => state.setAudioInitialized);
  const { scrollYProgress } = useScroll();

  const handleEngagement = useCallback(async () => {
    const isRunning = await audioCore.resume();
    if (isRunning) {
      audioCore.initDrone();
      audioCore.setMuted(isMuted);
      setAudioInitialized(true);
    }
  }, [isMuted, setAudioInitialized]);

  useEffect(() => {
    // Standard user gestures for audio
    const events = ['mousedown', 'keydown', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, handleEngagement));
    
    return () => {
      events.forEach(e => window.removeEventListener(e, handleEngagement));
    };
  }, [handleEngagement]);

  useEffect(() => {
    audioCore.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      audioCore.updatePitch(latest);
    });
  }, [scrollYProgress]);

  return <>{children}</>;
};
