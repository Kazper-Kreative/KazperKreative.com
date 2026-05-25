"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUISound } from '@/hooks/useUISound';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';
import CommsTerminal from './CommsTerminal';

interface Job {
  _id: string;
  title: string;
  status: 'PENDING' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'DECLINED';
  description?: string;
  client?: { name: string };
}

interface AgentWorkspaceProps {
  jobs: Job[];
  currentUserEmail?: string;
}

const COLUMNS = [
  { id: 'PENDING', title: 'New', color: 'text-amber-500', borderColor: 'border-amber-500/30' },
  { id: 'ACTIVE', title: 'Active', color: 'text-purple-400', borderColor: 'border-purple-500/30' },
  { id: 'COMPLETED', title: 'Completed', color: 'text-emerald-500', borderColor: 'border-emerald-500/30' },
];

export default function AgentWorkspace({ jobs: initialJobs, currentUserEmail = '' }: AgentWorkspaceProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [activeCommsJobId, setActiveCommsJobId] = useState<string | null>(null);
  const { playSound } = useUISound();

  const handleStatusChange = (jobId: string, newStatus: Job['status']) => {
    playSound(newStatus === 'ACTIVE' ? 'success' : 'click');
    setJobs(prev => prev.map(job =>
      job._id === jobId ? { ...job, status: newStatus } : job
    ));
    // In a real app, we'd call an API here to update Sanity
  };

  return (
    <div className="w-full">
      <header className="border-b border-zinc-800 pb-4 mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Workstation</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        {COLUMNS.map(col => (
          <div key={col.id} className={`flex flex-col h-full bg-zinc-900/40 border ${col.borderColor} rounded-lg overflow-hidden`}>
            <div className={`p-4 border-b ${col.borderColor} bg-black/40`}>
              <h3 className={`text-sm font-bold tracking-wide ${col.color}`}>{col.title}</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
              <AnimatePresence>
                {jobs.filter(job => job.status === col.id || (col.id === 'ACTIVE' && job.status === 'IN_REVIEW')).map(job => (
                  <motion.div
                    key={job._id}
                    layoutId={job._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-black/60 border border-zinc-800 p-4 rounded hover:border-purple-500/50 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] text-zinc-500">#{job._id.slice(0, 6)}</span>
                      {job.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(job._id, 'ACTIVE')}
                            className="text-emerald-500 hover:bg-emerald-500/10 p-1 rounded"
                            title="Accept"
                          >
                            <ClientSafeIcon name="Check" size={14} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(job._id, 'DECLINED')}
                            className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                            title="Decline"
                          >
                            <ClientSafeIcon name="X" size={14} />
                          </button>
                        </div>
                      )}
                      {job.status === 'ACTIVE' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { playSound('click'); setActiveCommsJobId(job._id); }}
                            className="text-cyan-500 hover:bg-cyan-500/10 p-1 rounded text-[10px] border border-cyan-500/30 px-2"
                            aria-label={`Open chat for ${job.title}`}
                          >
                            Chat
                          </button>
                          <button
                            onClick={() => handleStatusChange(job._id, 'COMPLETED')}
                            className="text-purple-400 hover:bg-purple-500/10 p-1 rounded text-[10px] border border-purple-500/30 px-2"
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </div>

                    <h4 className="text-white font-bold text-sm mb-1">{job.title}</h4>
                    <p className="text-zinc-500 text-xs line-clamp-2">{job.description || 'No description.'}</p>

                    {job.client && (
                      <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[8px] font-bold">
                          {job.client.name.charAt(0)}
                        </div>
                        <span className="text-[10px] text-zinc-400">{job.client.name}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {jobs.filter(job => job.status === col.id).length === 0 && (
                <div className="h-24 flex items-center justify-center text-zinc-700 text-xs italic border border-dashed border-zinc-800 rounded">
                  Nothing here yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {activeCommsJobId && currentUserEmail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-500 text-xs uppercase tracking-widest">Conversation</span>
              <button
                onClick={() => setActiveCommsJobId(null)}
                className="text-zinc-500 hover:text-white text-xs border border-zinc-800 px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
            <CommsTerminal
              jobId={activeCommsJobId}
              jobTitle={jobs.find(j => j._id === activeCommsJobId)?.title || 'Unknown'}
              currentUserEmail={currentUserEmail}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
