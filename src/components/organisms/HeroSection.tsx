import React from 'react';
import Button from '@/components/atoms/Button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-4 text-white sm:p-8">
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
        <h1 className="text-5xl font-black tracking-tight leading-none sm:text-6xl md:text-7xl lg:text-8xl mb-4">
          IMMERSION ENGINEERED.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
          Kazper Kreative: Full-Cycle Game Development & QA Validation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
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
