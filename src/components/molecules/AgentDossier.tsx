"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';
import { Agent } from '@/types/agent';

interface AgentDossierProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentDossier({ agent, isOpen, onClose }: AgentDossierProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8" role="dialog" aria-modal="true" aria-labelledby="dossier-heading">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-zinc-900 border border-purple-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)]"
          >
            <div className="flex flex-col md:flex-row h-full max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Image / Sidebar */}
              <div className="w-full md:w-1/3 bg-black/40 border-r border-zinc-800 p-8 flex flex-col">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700 mb-6">
                  <Image
                    src={agent.pictureUrl}
                    alt={agent.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
                </div>

                <div className="mt-auto pt-8">
                  <a
                    href={agent.upworkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors text-xs uppercase tracking-widest"
                  >
                    View Upwork profile <ClientSafeIcon name="ExternalLink" size={14} />
                  </a>
                </div>
              </div>

              {/* Main Content */}
              <div className="w-full md:w-2/3 p-8 md:p-12 relative">
                <button
                  onClick={onClose}
                  aria-label="Close profile"
                  className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                >
                  <ClientSafeIcon name="X" size={24} />
                </button>

                <h2 id="dossier-heading" className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{agent.name}</h2>
                <p className="text-zinc-400 text-lg italic mb-8">{agent.role}</p>

                <div className="h-px w-full bg-gradient-to-r from-purple-500/30 to-transparent mb-8" />

                <div className="prose prose-invert max-w-none mb-8">
                  <p className="text-zinc-300 leading-relaxed text-lg">
                    {agent.bio}
                  </p>
                </div>

                {agent.specialties && agent.specialties.length > 0 && (
                  <>
                    <h4 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Specialties</h4>
                    <div className="flex flex-wrap gap-3">
                      {agent.specialties.map((specialty, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-zinc-800/50 text-zinc-300 rounded border border-zinc-700 text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
