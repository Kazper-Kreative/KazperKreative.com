"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';
import HUD from './HUD';
import CommandPalette from './CommandPalette';
import QuickActions from './QuickActions';
import IdentityBadge from '@/components/atoms/IdentityBadge';
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
  const [platform, setPlatform] = useState<'mac' | 'win'>('win');
  const pathname = usePathname();
  const { playSound } = useUISound();

  useEffect(() => {
    setMounted(true);
    const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
    setPlatform(isMac ? 'mac' : 'win');

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
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
    <>
      <HUD />
      <CommandPalette />
      <QuickActions />
      
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-[100] top-0 transition-all duration-500 will-change-transform ${
          scrolled ? 'bg-black/40 backdrop-blur-md py-4 border-b border-purple-500/10' : 'bg-transparent py-8'
        }`}
        suppressHydrationWarning
      >
        <div className="container mx-auto px-8 flex justify-between items-center" suppressHydrationWarning>
          <div className="flex items-center space-x-8">
            <Link href="/" className="group flex items-center space-x-2" suppressHydrationWarning onClick={() => playSound('click')} onMouseEnter={() => playSound('hover')}>
              <div className="w-8 h-8 bg-purple-600 rounded-sm flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                <span className="text-black font-black text-xs">K</span>
              </div>
              <span className="text-sm font-black tracking-[0.3em] text-white uppercase hidden sm:block">
                KAZPER_KREATIVE
              </span>
            </Link>

            <div className="hidden lg:flex items-center space-x-1 font-mono text-[10px] text-zinc-500">
              <span className="px-2 py-1 border border-zinc-800 rounded">v1.0.4</span>
              <span className="px-2 py-1 border border-zinc-800 rounded animate-pulse text-purple-400/70">STRIKE_READY</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" suppressHydrationWarning>
            <div className="flex space-x-6 mr-6 border-r border-zinc-800 pr-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className={`text-[10px] font-mono uppercase tracking-widest hover:text-purple-400 transition-colors ${
                    pathname === link.href ? 'text-purple-500' : 'text-zinc-400'
                  }`}
                  suppressHydrationWarning
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <button 
              className="flex items-center justify-center w-8 h-8 bg-zinc-900 border border-zinc-800 rounded hover:border-purple-500/50 transition-all group relative"
              onClick={() => {
                playSound('click');
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              onMouseEnter={() => playSound('hover')}
              title={`Command Center (${platform === 'mac' ? '⌘K' : 'CTRL+K'})`}
            >
              <ClientSafeIcon name="Search" size={14} className="text-zinc-500 group-hover:text-purple-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <IdentityBadge />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4" suppressHydrationWarning>
             <button 
              className="p-2 text-zinc-400"
              onClick={() => {
                playSound('click');
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              onMouseEnter={() => playSound('hover')}
            >
              <ClientSafeIcon name="Search" size={20} />
            </button>
            <button 
              onClick={() => {
                playSound('click');
                setMobileMenuOpen(!mobileMenuOpen);
              }} 
              onMouseEnter={() => playSound('hover')}
              className="text-white focus:outline-none p-2 border border-zinc-800 rounded"
              suppressHydrationWarning
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
              suppressHydrationWarning
            >
              <div className="flex justify-between items-center mb-12">
                 <span className="text-xs font-mono text-purple-500">// MENU_ACCESS</span>
                 <button onClick={() => {
                   playSound('click');
                   setMobileMenuOpen(false);
                 }} className="p-2 border border-zinc-800 rounded">
                    <ClientSafeIcon name="X" size={24} className="text-white" />
                 </button>
              </div>

              <div className="flex flex-col space-y-6" suppressHydrationWarning>
                {navLinks.map((link, i) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-4xl font-black text-white uppercase tracking-tighter hover:text-purple-500 transition-colors"
                    onMouseEnter={() => playSound('hover')}
                    onClick={handleNavLinkClick}
                    suppressHydrationWarning
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

              <div className="mt-auto pt-8 border-t border-zinc-800 flex flex-col space-y-4 font-mono text-[10px] text-zinc-500">
                <div className="flex justify-between">
                  <span>LATENCY</span>
                  <span className="text-purple-500">14MS</span>
                </div>
                <div className="flex justify-between">
                  <span>ENCRYPTION</span>
                  <span className="text-purple-500">AES_256</span>
                </div>
                <div className="flex justify-between">
                  <span>NODE</span>
                  <span className="text-purple-500">ONTARIO_CA</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
