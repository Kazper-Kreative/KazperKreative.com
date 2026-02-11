import React from 'react';
import Button from '@/components/atoms/Button';
import PageWrapper from './PageWrapper'; // Assuming HeroSection is often wrapped by PageWrapper or a similar layout

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center bg-zinc-950 text-white overflow-hidden p-8">
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

      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight mb-4 leading-none uppercase">
          IMMERSION ENGINEERED.
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl">
          Kazper Kreative: Full-Cycle Game Development & QA Validation.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
          <Button variant="primary" size="lg">
            View Projects
          </Button>
          <Button variant="secondary" size="lg">
            Our Process
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
