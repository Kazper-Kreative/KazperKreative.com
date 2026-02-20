"use client";

import React from 'react';
import { signIn } from 'next-auth/react';
import PageWrapper from '@/components/layouts/PageWrapper';
import { motion } from 'framer-motion';
import { useUISound } from '@/hooks/useUISound';

export default function UnauthorizedPage() {
  const { playSound } = useUISound();

  const handleAuth = (provider: string) => {
    playSound('click');
    signIn(provider);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono">
        <div className="w-full max-w-lg border border-red-500/30 bg-red-500/5 p-8 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.1)] text-center relative overflow-hidden">
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-20"
          >
            <div className="mb-6 inline-block p-4 border border-red-500 text-red-500 rounded-full animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            
            <h1 className="text-3xl font-black text-red-500 tracking-tighter mb-2 uppercase">RESTRICTED_ACCESS</h1>
            <p className="text-zinc-500 text-xs mb-8 tracking-widest uppercase">ENCRYPTION LEVEL: SECURE // AUTHORIZATION REQUIRED</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleAuth('google')}
                className="w-full py-4 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white transition-all uppercase text-xs tracking-[0.2em] bg-black/40"
              >
                Authorize via Google Node
              </button>
              <button 
                onClick={() => handleAuth('github')}
                className="w-full py-4 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white transition-all uppercase text-xs tracking-[0.2em] bg-black/40"
              >
                Authorize via GitHub Node
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-900">
              <p className="text-[9px] text-zinc-700 leading-relaxed max-w-sm mx-auto">
                BY AUTHORIZING, YOU ARE ESTABLISHING A PERSISTENT IDENTITY WITHIN THE KAZPER ECOSYSTEM. 
                UNAUTHORIZED DECRYPTION ATTEMPTS WILL BE LOGGED.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
