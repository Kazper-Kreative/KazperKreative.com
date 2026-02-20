"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUISound } from '@/hooks/useUISound';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';

interface Job {
  _id: string;
  title: string;
  status: 'PENDING' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'DECLINED';
  description?: string;
  client?: { name: string };
}

interface AgentWorkspaceProps {
  jobs: Job[];
}

const COLUMNS = [
  { id: 'PENDING', title: 'INCOMING BRIEFS', color: 'text-amber-500', borderColor: 'border-amber-500/30' },
  { id: 'ACTIVE', title: 'ACTIVE OPERATIONS', color: 'text-purple-500', borderColor: 'border-purple-500/30' },
  { id: 'COMPLETED', title: 'MISSION ARCHIVE', color: 'text-emerald-500', borderColor: 'border-emerald-500/30' },
];

export default function AgentWorkspace({ jobs: initialJobs }: AgentWorkspaceProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const { playSound } = useUISound();

  const handleStatusChange = (jobId: string, newStatus: Job['status']) => {
    playSound(newStatus === 'ACTIVE' ? 'success' : 'click');
    setJobs(prev => prev.map(job => 
      job._id === jobId ? { ...job, status: newStatus } : job
    ));
    // In a real app, we'd call an API here to update Sanity
  };

  return (
    <div className="w-full font-mono">
      <header className="flex items-center justify-between border-b border-purple-500/30 pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-purple-500 tracking-tighter">AGENCY WORKSTATION</h1>
          <p className="text-purple-900 text-xs">OPERATOR: AUTHORIZED // LEVEL: ELITE</p>
        </div>
        <div className="text-right">
          <span className="text-purple-500/50 text-[10px] animate-pulse">LIVE_FEED_ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        {COLUMNS.map(col => (
          <div key={col.id} className={`flex flex-col h-full bg-zinc-900/40 border ${col.borderColor} rounded-lg overflow-hidden`}>
            <div className={`p-4 border-b ${col.borderColor} bg-black/40`}>
              <h3 className={`text-xs font-bold tracking-widest ${col.color}`}>{col.title}</h3>
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
                      <span className="text-[9px] text-zinc-500 uppercase">#{job._id.slice(0, 6)}</span>
                      {job.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusChange(job._id, 'ACTIVE')}
                            className="text-emerald-500 hover:bg-emerald-500/10 p-1 rounded"
                            title="Accept Mission"
                          >
                            <ClientSafeIcon name="Check" size={14} />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(job._id, 'DECLINED')}
                            className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                            title="Decline Mission"
                          >
                            <ClientSafeIcon name="X" size={14} />
                          </button>
                        </div>
                      )}
                      {job.status === 'ACTIVE' && (
                        <button 
                          onClick={() => handleStatusChange(job._id, 'COMPLETED')}
                          className="text-purple-500 hover:bg-purple-500/10 p-1 rounded text-[10px] border border-purple-500/30 px-2"
                        >
                          COMPLETE
                        </button>
                      )}
                    </div>
                    
                    <h4 className="text-white font-bold text-sm mb-1">{job.title}</h4>
                    <p className="text-zinc-500 text-xs line-clamp-2">{job.description || 'No briefing provided.'}</p>
                    
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
                <div className="h-24 flex items-center justify-center text-zinc-700 text-[10px] italic border border-dashed border-zinc-800 rounded">
                  NO_DATA
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
