"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation'; // Import usePathname from next/navigation

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/#services' },
  { name: 'Work', href: '/#work' },
  { name: 'Agents', href: '/agents' },
  { name: 'Contact', href: '/#contact' },
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
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
        <div className="flex space-x-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} passHref>
              <motion.a
                className={`text-gray-300 hover:text-white transition-colors relative group ${
                  pathname === link.href || (link.href.includes('#') && pathname === link.href.split('#')[0])
                    ? 'text-purple-400 font-semibold'
                    : ''
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.name}
                <span
                  className={`absolute left-0 bottom-0 h-[2px] bg-purple-500 transition-all duration-300 ${
                    pathname === link.href || (link.href.includes('#') && pathname === link.href.split('#')[0])
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </motion.a>
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
