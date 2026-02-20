"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useUserRole } from '@/hooks/useUserRole';

export default function IdentityBadge() {
  const { role, identityId, getThemeColor } = useUserRole();
  const themeColor = getThemeColor();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 font-mono text-[9px] tracking-[0.2em]"
    >
      <div 
        className="px-2 py-0.5 border rounded-full transition-colors duration-500"
        style={{ borderColor: `${themeColor}40`, color: themeColor, backgroundColor: `${themeColor}05` }}
      >
        {role}
      </div>
      <div className="text-zinc-600">
        ID: <span className="text-zinc-400">{identityId}</span>
      </div>
    </motion.div>
  );
}
