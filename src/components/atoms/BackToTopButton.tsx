"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) { // Show button after scrolling 300px
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-zinc-900/80 backdrop-blur-md text-purple-500 p-4 border border-purple-500/30 rounded-sm shadow-2xl hover:bg-purple-600 hover:text-white transition-all z-50 group overflow-hidden"
          aria-label="Scroll to top"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <ArrowUp size={20} className="relative z-10 group-hover:-translate-y-1 transition-transform" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-purple-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTopButton;
