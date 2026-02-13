"use client";

import React from 'react';
import Button from '@/components/atoms/Button';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import Link from 'next/link';

const HeroSection: React.FC = () => {
  const handleScrollDown = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white sm:p-8"
    >
      {/* Subtle tech-grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-black tracking-tight leading-none sm:text-6xl md:text-7xl lg:text-8xl mb-4 break-words">
          IMMERSION ENGINEERED.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl break-words">
          Kazper Kreative: Full-Cycle Game Development & QA Validation.
        </p>
        import Link from 'next/link';

// ... inside the component, replace the buttons div with this:
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="#work">
            <Button variant="primary" size="lg">
              View Projects
            </Button>
          </Link>
          <Link href="#services">
            <Button variant="secondary" size="lg">
              Our Process
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
      >
        <ArrowDown className="text-purple-400" size={32} />
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
