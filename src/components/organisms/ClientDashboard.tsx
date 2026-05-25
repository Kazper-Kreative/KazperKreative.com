"use client";

import React from 'react';
import Link from 'next/link';
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

const STATUS_LABELS: Record<Job['status'], string> = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  IN_REVIEW: 'In review',
  COMPLETED: 'Completed',
  DECLINED: 'Declined',
};

const STATUS_COLORS: Record<Job['status'], string> = {
  PENDING: 'text-amber-500 border-amber-500/30',
  ACTIVE: 'text-emerald-500 border-emerald-500/30',
  IN_REVIEW: 'text-blue-500 border-blue-500/30',
  COMPLETED: 'text-zinc-500 border-zinc-500/30',
  DECLINED: 'text-red-500 border-red-500/30',
};

export default function ClientDashboard({ jobs }: ClientDashboardProps) {
  return (
    <div className="w-full space-y-8">
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Your projects</h1>
      </header>

      {jobs.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-500 mb-4">No projects yet.</p>
          <Link
            href="/discovery"
            className="text-purple-400 hover:text-purple-300 border border-purple-500/50 px-4 py-2 hover:bg-purple-500/10 transition-colors text-sm rounded"
          >
            Start a project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-6 border rounded-lg bg-zinc-900/40 hover:border-purple-500/50 transition-all group ${STATUS_COLORS[job.status]}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] text-zinc-500">ID: {job._id.slice(0, 8)}</span>
                <span className="text-[10px] px-2 py-0.5 border border-current rounded-full">
                  {STATUS_LABELS[job.status]}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {job.title}
              </h3>
              <p className="text-sm text-zinc-400 line-clamp-2 h-10">
                {job.description || 'No description.'}
              </p>
              <div className="mt-6 flex justify-end">
                <button className="text-xs uppercase tracking-widest text-zinc-500 hover:text-purple-400 border-b border-transparent hover:border-current transition-colors">
                  View details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
