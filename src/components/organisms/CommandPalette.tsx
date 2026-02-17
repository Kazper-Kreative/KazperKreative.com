"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';
import { useUISound } from '@/hooks/useUISound';
import { useGamificationStore } from '@/store/useGamificationStore';

const actions = [
  { id: 'home', name: 'Go to Home', icon: 'Terminal', href: '/' },
  { id: 'services', name: 'Our Expertise (Services)', icon: 'Command', href: '/#services' },
  { id: 'work', name: 'View Deployed Experiences (Work)', icon: 'Command', href: '/#work' },
  { id: 'agents', name: 'Meet Our Engineers (Agents)', icon: 'Terminal', href: '/agents' },
  { id: 'discovery', name: 'Initialize Discovery Operations', icon: 'Search', href: '/discovery' },
  { id: 'contact', name: 'Direct Collaboration (Contact)', icon: 'Command', href: '/#contact' },
];

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'commands' | 'profile' | 'diagnostics'>('commands');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { playSound } = useUISound();
  
  // Gamification
  const { xp, level, badges, unlockedBadges } = useGamificationStore();

  const [platform, setPlatform] = useState<'mac' | 'win'>('win');
  const [location, setLocation] = useState<string>('DETECTING...');

  useEffect(() => {
    const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
    setPlatform(isMac ? 'mac' : 'win');

    // Fetch user location
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city && data.region_code) {
          setLocation(`${data.city.toUpperCase()}, ${data.region_code}`);
        } else {
          setLocation('ONTARIO, CA'); // Fallback
        }
      })
      .catch(() => setLocation('ONTARIO, CA'));

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) playSound('click');
          return !prev;
        });
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActiveTab('commands');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredActions = actions.filter((action) =>
    action.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    playSound('success');
    setIsOpen(false);
    router.push(href);
    if (href.includes('#')) {
      const id = href.split('#')[1];
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      playSound('hover');
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      playSound('hover');
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      if (activeTab === 'commands' && filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex].href);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      playSound('hover');
      const tabs: ('commands' | 'profile' | 'diagnostics')[] = ['commands', 'profile', 'diagnostics'];
      const nextIndex = (tabs.indexOf(activeTab) + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    }
  };

  const modKey = platform === 'mac' ? '⌘' : 'CTRL';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" suppressHydrationWarning>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
            suppressHydrationWarning
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-zinc-900/90 border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden"
            suppressHydrationWarning
            onKeyDown={onKeyDown}
          >
            {/* Tabs */}
            <div className="flex border-b border-zinc-800 bg-black/20" suppressHydrationWarning>
              {(['commands', 'profile', 'diagnostics'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    playSound('hover');
                    setActiveTab(tab);
                  }}
                  className={`px-6 py-3 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                    activeTab === tab ? 'text-purple-400 bg-purple-500/5' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'commands' && (
              <>
                <div className="flex items-center px-4 py-4 border-b border-zinc-800" suppressHydrationWarning>
                  <div className="mr-3 w-8 h-8 bg-purple-600/10 border border-purple-500/30 rounded flex items-center justify-center text-[10px] font-mono text-purple-400 font-bold">
                    {modKey}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a command or search..."
                    className="w-full bg-transparent text-white outline-none text-lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="text-[10px] text-zinc-500 font-mono border border-zinc-700 px-1.5 py-0.5 rounded">
                    ESC
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-2" suppressHydrationWarning>
                  {filteredActions.length > 0 ? (
                    filteredActions.map((action, index) => (
                      <div
                        key={action.id}
                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                          index === selectedIndex ? 'bg-purple-600/20 text-white' : 'text-zinc-400 hover:bg-zinc-800/50'
                        }`}
                        onClick={() => handleSelect(action.href)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <ClientSafeIcon name={action.icon as any} className="mr-4 opacity-70" size={18} />
                        <span className="flex-grow font-medium">{action.name}</span>
                        {index === selectedIndex && (
                          <span className="text-[10px] text-purple-400 font-mono">ENTER</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-zinc-500 font-mono text-sm">
                      // NO_RESULTS_FOUND
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'profile' && (
              <div className="p-8 max-h-[60vh] overflow-y-auto" suppressHydrationWarning>
                <div className="flex items-center space-x-6 mb-8 border-b border-zinc-800 pb-8">
                  <div className="w-20 h-20 bg-purple-600/20 border border-purple-500/50 rounded-lg flex items-center justify-center">
                    <span className="text-4xl font-black text-purple-400">{level}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Level {level} Engineer</h3>
                    <p className="text-zinc-500 font-mono text-xs">EXPERIENCE_POINTS: {xp}</p>
                    <div className="mt-2 w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${(xp % 1000) / 10}%` }} />
                    </div>
                  </div>
                </div>

                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4">// UNLOCKED_BADGES</h4>
                <div className="grid grid-cols-2 gap-4">
                  {badges.map((badge) => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    return (
                      <div 
                        key={badge.id} 
                        className={`p-4 rounded-lg border flex items-center space-x-4 transition-all ${
                          isUnlocked ? 'bg-purple-600/5 border-purple-500/30' : 'bg-zinc-950/50 border-zinc-800 opacity-40'
                        }`}
                      >
                        <ClientSafeIcon 
                          name={badge.icon as any} 
                          className={isUnlocked ? 'text-purple-400' : 'text-zinc-600'} 
                          size={24} 
                        />
                        <div>
                          <p className={`text-xs font-bold uppercase ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>{badge.name}</p>
                          <p className="text-[10px] text-zinc-600 leading-tight">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'diagnostics' && (
              <div className="p-8 font-mono text-xs text-zinc-400 space-y-4" suppressHydrationWarning>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-purple-500">// SYSTEM_METRICS</p>
                    <div className="flex justify-between"><span>CPU_USAGE</span><span className="text-white">14%</span></div>
                    <div className="flex justify-between"><span>MEM_LOAD</span><span className="text-white">2.4GB</span></div>
                    <div className="flex justify-between"><span>LATENCY</span><span className="text-white">14MS</span></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-purple-500">// NODE_METRICS</p>
                    <div className="flex justify-between"><span>LOCATION</span><span className="text-white">{location}</span></div>
                    <div className="flex justify-between"><span>ENCRYPTION</span><span className="text-white">AES_256</span></div>
                    <div className="flex justify-between"><span>STATUS</span><span className="text-green-500">OPTIMAL</span></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-purple-500 mb-2">// RECENT_LOGS</p>
                  <p className="opacity-50">[12:45:01] SECURE_CONNECTION_ESTABLISHED</p>
                  <p className="opacity-50">[12:45:05] DATA_PACKET_VALIDATED</p>
                  <p className="opacity-50">[12:45:10] ATMOSPHERIC_DRONE_INITIALIZED</p>
                </div>
              </div>
            )}

            <div className="px-4 py-2 border-t border-zinc-800 bg-black/20 flex justify-between items-center text-[10px] text-zinc-500 font-mono" suppressHydrationWarning>
              <span>SYSTEM-V INTERFACE</span>
              <div className="flex space-x-4">
                <span>TAB TO SWITCH</span>
                <span>↑↓ TO NAVIGATE</span>
                <span>↵ TO SELECT</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
