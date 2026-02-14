"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react'; // Import Menu and X icons

const navLinks = [
  { name: 'Home', href: '/' },
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

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false); // Close mobile menu on link click
  };

  return (
    <motion.nav
      className={`fixed w-full z-40 top-0 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md py-3 border-b border-purple-500/30' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
          KAZPER KREATIVE
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-gray-300 hover:text-white transition-colors relative group ${
                pathname === link.href || (link.href.includes('#') && pathname === link.href.split('#')[0])
                  ? 'text-purple-400 font-semibold'
                  : ''
              }`}
            >
              <motion.span
                className="inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.name}
              </motion.span>
              <span
                className={`absolute left-0 bottom-0 h-[2px] bg-purple-500 transition-all duration-300 ${
                  pathname === link.href || (link.href.includes('#') && pathname === link.href.split('#')[0])
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="text-white focus:outline-none"
            suppressHydrationWarning
          >
            {mounted ? (mobileMenuOpen ? <X size={24} /> : <Menu size={24} />) : <div className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black/90 backdrop-blur-md absolute top-full left-0 w-full pb-4 border-b border-purple-500/30"
          >
            <div className="flex flex-col items-center space-y-4 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-gray-300 text-lg hover:text-white transition-colors ${
                    pathname === link.href || (link.href.includes('#') && pathname === link.href.split('#')[0])
                      ? 'text-purple-400 font-semibold'
                      : ''
                  }`}
                  onClick={handleNavLinkClick}
                >
                  <motion.span
                    className="inline-block"
                    whileHover={{ scale: 1.05 }}
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
