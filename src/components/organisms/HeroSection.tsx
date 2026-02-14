"use client";

import React from 'react';
import Button from '@/components/atoms/Button';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import Link from 'next/link';
import TechnicalBackground from '@/components/atoms/TechnicalBackground';

const HeroSection: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleScrollDown = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white sm:p-8 overflow-hidden"
      suppressHydrationWarning
    >
      <TechnicalBackground />

      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4" suppressHydrationWarning>
        <h1 className="text-5xl font-black tracking-tight leading-none sm:text-6xl md:text-7xl lg:text-8xl mb-4 break-words" suppressHydrationWarning>
          IMMERSION ENGINEERED.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl break-words" suppressHydrationWarning>
          Kazper Kreative: Full-Cycle Game Development &amp; QA Validation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4" suppressHydrationWarning>
          <Link href="#work">
            <Button variant="primary" size="lg">
              View Projects
            </Button>
          </Link>
          <Link href="#work-with-us">
            <Button variant="secondary" size="lg">
              Explore Opportunities
            </Button>
          </Link>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 cursor-pointer"
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        onClick={handleScrollDown}
        suppressHydrationWarning
      >
        {mounted ? <ArrowDown className="text-purple-400" size={32} /> : <div className="w-8 h-8" />}
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
