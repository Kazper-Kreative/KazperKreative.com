"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';
import { useUISound } from '@/hooks/useUISound';

const navLinks = [
  { name: 'Services', href: '/#services' },
  { name: 'Work', href: '/#work' },
  { name: 'Agents', href: '/agents' },
  { name: 'Contact', href: '/#contact' },
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { playSound } = useUISound();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavLinkClick = () => {
    playSound('click');
    setMobileMenuOpen(false);
  };

  if (!mounted) return null;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-[100] top-0 transition-all duration-500 will-change-transform ${
        scrolled ? 'bg-black/40 backdrop-blur-md py-4 border-b border-purple-500/10' : 'bg-transparent py-8'
      }`}
    >
      <div className="container mx-auto px-8 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="group flex items-center space-x-2" onClick={() => playSound('click')} onMouseEnter={() => playSound('hover')}>
            <div className="w-8 h-8 bg-purple-600 rounded-sm flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
              <span className="text-black font-black text-xs">K</span>
            </div>
            <span className="text-sm font-black tracking-[0.3em] text-white uppercase hidden sm:block">
              KAZPER_KREATIVE
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className={`text-xs uppercase tracking-widest hover:text-purple-400 transition-colors ${
                pathname === link.href ? 'text-purple-400' : 'text-zinc-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => {
              playSound('click');
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            onMouseEnter={() => playSound('hover')}
            className="text-white focus:outline-none p-2 border border-zinc-800 rounded"
          >
            <ClientSafeIcon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 z-[90] bg-black flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Menu</span>
              <button aria-label="Close menu" onClick={() => {
                playSound('click');
                setMobileMenuOpen(false);
              }} className="p-2 border border-zinc-800 rounded">
                <ClientSafeIcon name="X" size={24} className="text-white" />
              </button>
            </div>

            <div className="flex flex-col space-y-6">
              {navLinks.map((link, i) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-4xl font-black text-white uppercase tracking-tighter hover:text-purple-500 transition-colors"
                  onMouseEnter={() => playSound('hover')}
                  onClick={handleNavLinkClick}
                >
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {link.name}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
