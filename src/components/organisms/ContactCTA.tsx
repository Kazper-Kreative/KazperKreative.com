"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Button from '@/components/atoms/Button';
import { AnimatePresence } from 'framer-motion';

const ContactForm = dynamic(() => import('./ContactForm'), {
  ssr: false
});

const ContactCTA: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <section className="bg-purple-900/20 py-16 sm:py-24 flex flex-col items-center justify-center text-center px-4" suppressHydrationWarning>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 break-words" suppressHydrationWarning>INITIATE COLLABORATION.</h2>
        <p className="text-lg sm:text-xl text-purple-200 mb-10 max-w-2xl px-4" suppressHydrationWarning>
          Kazper Kreative is accepting select contracts for Q3 2026.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="relative group overflow-hidden"
          onClick={() => setIsFormOpen(true)}
          suppressHydrationWarning
        >
          <span className="relative z-10" suppressHydrationWarning>Request Intelligence</span>
          {/* Simple glitch-like visual effect on hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" suppressHydrationWarning></span>
        </Button>
      </section>

      <AnimatePresence>
        {isFormOpen && <ContactForm onClose={() => setIsFormOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default ContactCTA;
