"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface Job {
  _id: string;
  title: string;
  status: 'PENDING' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'DECLINED';
  description?: string;
}

interface ClientDashboardProps {
  jobs: Job[];
}

const STATUS_COLORS = {
  PENDING: 'text-amber-500 border-amber-500/30',
  ACTIVE: 'text-emerald-500 border-emerald-500/30',
  IN_REVIEW: 'text-blue-500 border-blue-500/30',
  COMPLETED: 'text-zinc-500 border-zinc-500/30',
  DECLINED: 'text-red-500 border-red-500/30',
};

export default function ClientDashboard({ jobs }: ClientDashboardProps) {
  return (
    <div className="w-full space-y-8 font-mono">
      <header className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-500 tracking-tighter">CLIENT COMMAND CENTER</h1>
          <p className="text-emerald-900 text-xs">STATUS: CONNECTED // ENCRYPTION: ACTIVE</p>
        </div>
        <div className="text-right">
          <span className="text-emerald-500/50 text-[10px]">AUTH_SESSION_ID: 0x9F...3A</span>
        </div>
      </header>

      {jobs.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-emerald-500/20 rounded-lg">
          <p className="text-emerald-900 animate-pulse">NO ACTIVE OPERATIONS FOUND</p>
          <button className="mt-4 text-emerald-500 border border-emerald-500 px-4 py-2 hover:bg-emerald-500/10 transition-colors text-sm">
            INITIALIZE NEW BRIEF
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 border rounded-lg bg-black/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all group ${STATUS_COLORS[job.status]}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] opacity-50">OP_ID: {job._id.slice(0, 8)}</span>
                <span className="text-[10px] px-2 border border-current rounded-full uppercase">
                  {job.status}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:tracking-widest transition-all">
                {job.title}
              </h3>
              <p className="text-xs opacity-70 line-clamp-2 h-8">
                {job.description || 'No data provided.'}
              </p>
              <div className="mt-6 flex justify-end">
                <button className="text-[10px] uppercase tracking-widest border-b border-current hover:opacity-50 transition-opacity">
                  Open Dossier
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
