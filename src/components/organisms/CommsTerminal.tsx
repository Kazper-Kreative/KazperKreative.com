"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUISound } from '@/hooks/useUISound';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';

interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface CommsTerminalProps {
  jobId: string;
  jobTitle: string;
  currentUserEmail: string;
}

export default function CommsTerminal({ jobId, jobTitle, currentUserEmail }: CommsTerminalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playSound } = useUISound();

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?jobId=${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // silently retry on next poll
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    playSound('click');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, sender: currentUserEmail, content: input.trim() }),
      });

      if (res.ok) {
        setInput('');
        playSound('success');
        await fetchMessages();
      }
    } catch {
      // error handled silently
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-purple-500/20 rounded-lg overflow-hidden font-mono">
      {/* Header */}
      <div className="px-6 py-4 border-b border-purple-500/20 bg-black/60 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm tracking-tight">{jobTitle}</h3>
        <div className="flex items-center gap-2 text-[10px] text-emerald-500">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-[300px] max-h-[50vh]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
            Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
            No messages yet.
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              const isOwn = msg.sender === currentUserEmail;
              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] px-4 py-3 rounded-lg text-sm ${
                    isOwn
                      ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] uppercase tracking-widest ${isOwn ? 'text-purple-400' : 'text-zinc-500'}`}>
                        {isOwn ? 'You' : msg.sender.split('@')[0]}
                      </span>
                      <span className="text-[9px] text-zinc-600">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-purple-500/20 bg-black/60">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 focus-within:border-purple-500/50 transition-colors">
            <span className="text-purple-500 text-xs mr-2">&gt;</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-zinc-600"
              disabled={sending}
              aria-label="Message input"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <ClientSafeIcon name="Send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
