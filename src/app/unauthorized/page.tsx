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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg border border-zinc-800 bg-zinc-900/40 p-8 rounded-xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Sign in required</h1>
            <p className="text-zinc-400 text-sm mb-8">
              This page is only available to signed-in users.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleAuth('google')}
                className="w-full py-3 border border-zinc-700 hover:border-purple-500 hover:bg-purple-500/5 text-zinc-200 hover:text-white transition-all text-sm rounded"
              >
                Continue with Google
              </button>
              <button
                onClick={() => handleAuth('github')}
                className="w-full py-3 border border-zinc-700 hover:border-purple-500 hover:bg-purple-500/5 text-zinc-200 hover:text-white transition-all text-sm rounded"
              >
                Continue with GitHub
              </button>
            </div>

            <p className="mt-8 pt-8 border-t border-zinc-800 text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
              Signing in creates a session linked to your email. We don&apos;t share it.
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
