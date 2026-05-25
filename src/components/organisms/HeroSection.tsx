"use client";

import React from 'react';
import Button from '@/components/atoms/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import TechnicalBackground from '@/components/organisms/TechnicalBackground';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';

interface HeroSectionProps {
  isVisible?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isVisible = true }) => {
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
     
    >
      <TechnicalBackground isVisible={isVisible} />

      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-black tracking-tight leading-none sm:text-6xl md:text-7xl lg:text-8xl mb-4 break-words">
          Game development &amp; QA, engineered end-to-end.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl break-words">
          Kazper Kreative builds Unreal Engine titles, QA pipelines, and immersive UI for studios in Ontario and beyond.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/start">
            <Button variant="primary" size="lg">
              Start a project
            </Button>
          </Link>
          <Link href="/#work">
            <Button variant="secondary" size="lg">
              View our work
            </Button>
          </Link>
        </div>
        <Link
          href="/experience"
          className="mt-8 text-xs uppercase tracking-widest text-zinc-500 hover:text-purple-400 transition-colors"
        >
          Enter the experience &rarr;
        </Link>
      </div>

      <motion.div
        className="absolute bottom-8 cursor-pointer"
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        onClick={handleScrollDown}
       
      >
        <ClientSafeIcon name="ArrowDown" className="text-purple-400" size={32} />
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
