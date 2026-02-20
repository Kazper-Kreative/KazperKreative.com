"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUISound } from '@/hooks/useUISound';

interface GhostScanProps {
  onComplete: () => void;
}

interface IntelligenceData {
  ip: string;
  isp: string;
  location: string;
  latency: string;
}

export default function GhostScan({ onComplete }: GhostScanProps) {
  const [logIndex, setLogIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [intelligence, setIntelligence] = useState<IntelligenceData | null>(null);
  const { playSound } = useUISound();

  useEffect(() => {
    // Fetch real-time connection data
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setIntelligence({
          ip: data.ip || '0.0.0.0',
          isp: data.org || 'UNKNOWN_PROVIDER',
          location: `${data.city || 'ONTARIO'}, ${data.region_code || 'CA'}`,
          latency: Math.floor(Math.random() * (45 - 12) + 12) + 'MS',
        });
      })
      .catch(() => {
        setIntelligence({
          ip: '127.0.0.1',
          isp: 'LOCAL_UPLINK',
          location: 'ONTARIO, CA',
          latency: '2MS',
        });
      });
  }, []);

  const logs = [
    "INITIALIZING GHOST_PROTOCOL...",
    intelligence ? `> SOURCE_IP: ${intelligence.ip}` : "SCANNING_SOURCE_IP...",
    intelligence ? `> UPLINK_NODE: ${intelligence.isp}` : "IDENTIFYING_NODE...",
    intelligence ? `> NODE_LATENCY: ${intelligence.latency}` : "MEASURING_LATENCY...",
    intelligence ? `> PHYSICAL_LOCATION: ${intelligence.location}` : "MAPPING_COORDINATES...",
    "FIREWALL_SHIELD: OPTIMAL",
    "IDENTITY VERIFIED: GUEST_SESSION",
  ];

  useEffect(() => {
    if (logIndex < logs.length) {
      const timer = setTimeout(() => {
        setLogIndex(logIndex + 1);
        playSound('click');
      }, 350);
      return () => clearTimeout(timer);
    } else {
      playSound('success');
      const timer = setTimeout(() => {
        setIsComplete(true);
        setTimeout(onComplete, 250);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [logIndex, playSound, onComplete, logs.length]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 font-mono"
        >
          {/* Scanning Line */}
          <motion.div
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10"
          />

          <div className="w-full max-w-md space-y-4">
            <div className="flex justify-between items-center text-emerald-500 text-[10px] tracking-widest mb-8">
              <span className="animate-pulse tracking-[0.3em]">AUDITING CONNECTION IDENTITY</span>
              <span>[ 0xAF_99 ]</span>
            </div>

            <div className="space-y-1 h-40 overflow-hidden">
              {logs.slice(0, logIndex).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-emerald-500/70 text-xs"
                >
                  {log}
                </motion.div>
              ))}
            </div>

            <div className="pt-8 flex justify-center">
              <div className="w-48 h-1 bg-emerald-900/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${(logIndex / logs.length) * 100}%` }}
                  className="h-full bg-emerald-500 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 text-[8px] text-emerald-900 tracking-[0.5em] uppercase">
            Kazper Kreative // Simulated Reality Environment
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
