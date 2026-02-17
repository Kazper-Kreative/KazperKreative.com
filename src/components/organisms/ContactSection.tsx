"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import Link from 'next/link';
import { useGamificationStore } from '@/store/useGamificationStore';

const ContactSection: React.FC = () => {
  const unlockBadge = useGamificationStore((state) => state.unlockBadge);

  return (
    <motion.section
      id="work-with-us"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto px-4 py-16 sm:py-24 text-white"
      suppressHydrationWarning
    >
      <div className="grid grid-cols-1 gap-12 md:gap-16" suppressHydrationWarning>
        {/* Action Center */}
        <div className="flex flex-col gap-12 max-w-2xl mx-auto" suppressHydrationWarning>
          {/* Block A: Fast Track Client Discovery */}
          <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800" suppressHydrationWarning>
            <h3 className="text-3xl font-bold text-purple-300 mb-4" suppressHydrationWarning>Require Our Expertise?</h3>
            <p className="text-zinc-400 mb-6" suppressHydrationWarning>
              Skip the queue. If you have a defined budget and timeline, book a 15-minute discovery call directly with our engineering lead.
            </p>
            <Link href="https://calendly.com/kazperkreative" target="_blank" rel="noopener noreferrer" suppressHydrationWarning>
              <Button variant="primary" size="lg" suppressHydrationWarning>Book Discovery Call</Button>
            </Link>
          </div>

          {/* Block B: Talent Acquisition */}
          <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800" suppressHydrationWarning>
            <h3 className="text-3xl font-bold text-purple-300 mb-4" suppressHydrationWarning>Join the Roster</h3>
            <p className="text-zinc-400 mb-6" suppressHydrationWarning>
              Are you an Unreal Dev, Audio Engineer, or UI Specialist looking for contract work?
            </p>
            <Link href="/agents/join" suppressHydrationWarning onClick={() => unlockBadge('recruit')}>
              <Button variant="secondary" size="lg" suppressHydrationWarning>Apply to Join</Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactSection;
