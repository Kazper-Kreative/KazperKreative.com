"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PortableText } from '@portabletext/react';

interface TechnicalBlockProps {
  title: string;
  content: any[];
  label: string;
}

const TechnicalBlock: React.FC<TechnicalBlockProps> = ({ title, content, label }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 md:p-12 mb-12 backdrop-blur-sm"
      suppressHydrationWarning
    >
      <div className="flex items-center mb-6" suppressHydrationWarning>
        <div className="h-px w-8 bg-purple-600 mr-4" suppressHydrationWarning />
        <span className="text-purple-500 font-mono text-xs tracking-[0.3em] uppercase" suppressHydrationWarning>
          // {label}
        </span>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 uppercase tracking-tight" suppressHydrationWarning>
        {title}
      </h2>
      
      <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed" suppressHydrationWarning>
        <PortableText value={content} />
      </div>
    </motion.div>
  );
};

export default TechnicalBlock;
