"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUISound } from '@/hooks/useUISound';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';

interface FormData {
  name: string;
  callsign: string;
  email: string;
  role: string;
  specialties: string;
  experience: string;
  portfolioUrl: string;
  bio: string;
}

const STEPS = [
  { key: 'name' as const, label: 'Name', prompt: 'Your full name.' },
  { key: 'callsign' as const, label: 'Handle (optional)', prompt: 'Username or callsign. Press Enter to skip.' },
  { key: 'email' as const, label: 'Email', prompt: 'How should we reach you?' },
  { key: 'role' as const, label: 'Role', prompt: 'What role are you applying for? (e.g. Full-stack dev, QA engineer, Game dev)' },
  { key: 'specialties' as const, label: 'Skills', prompt: 'Comma-separated. (e.g. React, Unity, Rust)' },
  { key: 'experience' as const, label: 'Years of experience', prompt: 'Years of professional experience.' },
  { key: 'portfolioUrl' as const, label: 'Portfolio (optional)', prompt: 'Link to portfolio or GitHub. Press Enter to skip.' },
  { key: 'bio' as const, label: 'Why Kazper?', prompt: 'Tell us a bit about yourself and why you want to work with us.' },
];

export default function ApplicantTerminal() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '', callsign: '', email: '', role: '',
    specialties: '', experience: '', portfolioUrl: '', bio: '',
  });
  const [status, setStatus] = useState<'active' | 'submitting' | 'success' | 'error'>('active');
  const [responseMsg, setResponseMsg] = useState('');
  const [log, setLog] = useState<string[]>(['> Welcome.', '> Let\'s get to know you.']);
  const { playSound } = useUISound();

  const currentStep = STEPS[step];

  const handleSubmitStep = () => {
    if (!currentStep) return;

    const isOptional = currentStep.key === 'callsign' || currentStep.key === 'portfolioUrl';
    if (!input.trim() && !isOptional) {
      playSound('click');
      setLog(prev => [...prev, `! ${currentStep.label} is required.`]);
      return;
    }

    playSound('success');
    const value = input.trim();
    setFormData(prev => ({ ...prev, [currentStep.key]: value }));
    setLog(prev => [...prev, `> ${currentStep.label}: ${value || '(skipped)'}`]);
    setInput('');

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinalSubmit({ ...formData, [currentStep.key]: value });
    }
  };

  const handleFinalSubmit = async (data: FormData) => {
    setStatus('submitting');
    setLog(prev => [...prev, '> Sending...']);

    try {
      const res = await fetch('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          specialties: data.specialties.split(',').map(s => s.trim()).filter(Boolean),
          experience: data.experience ? parseInt(data.experience) : undefined,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setStatus('success');
        setResponseMsg(result.message);
        setLog(prev => [...prev, `> ${result.message}`]);
        playSound('success');
      } else {
        setStatus('error');
        setResponseMsg(result.message);
        setLog(prev => [...prev, `! ${result.message}`]);
      }
    } catch {
      setStatus('error');
      setResponseMsg('Connection lost. Try again.');
      setLog(prev => [...prev, '! Send failed.']);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-mono">
      {/* Terminal Header */}
      <div className="bg-black border border-purple-500/30 rounded-t-lg px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-purple-400 text-[10px] tracking-widest">Apply to Kazper Kreative</span>
      </div>

      {/* Terminal Body */}
      <div className="bg-zinc-950 border-x border-b border-purple-500/30 rounded-b-lg p-6 min-h-[400px] flex flex-col">
        {/* Log output */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-1 max-h-[300px] custom-scrollbar">
          <AnimatePresence>
            {log.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs leading-relaxed ${
                  line.startsWith('!') ? 'text-red-500' :
                  line.startsWith('>') ? 'text-zinc-400' :
                  'text-zinc-400'
                }`}
              >
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {/* Active input or result */}
        {status === 'active' && currentStep && (
          <div>
            <p className="text-purple-400 text-[10px] uppercase tracking-widest mb-1">
              [{step + 1} of {STEPS.length}] {currentStep.label}
            </p>
            <p className="text-zinc-500 text-xs mb-3">{currentStep.prompt}</p>
            <div className="flex items-center bg-black border border-zinc-800 rounded px-4 py-2 focus-within:border-purple-500/50 transition-colors">
              <span className="text-purple-500 text-sm mr-2">&gt;</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitStep(); }}
                className="flex-1 bg-transparent text-white outline-none text-sm"
                placeholder={currentStep.label}
                autoFocus
                aria-label={currentStep.label}
              />
            </div>
          </div>
        )}

        {status === 'submitting' && (
          <div className="flex items-center gap-3 text-purple-400 text-sm">
            <ClientSafeIcon name="Loader" size={16} className="animate-spin" />
            Sending...
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
              <ClientSafeIcon name="Check" size={32} className="text-emerald-500" />
            </div>
            <p className="text-emerald-400 font-bold text-lg mb-2">Application received</p>
            <p className="text-zinc-500 text-xs">{responseMsg}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <p className="text-red-500 font-bold mb-2">Send failed</p>
            <p className="text-zinc-500 text-xs">{responseMsg}</p>
            <button
              onClick={() => { setStatus('active'); setStep(0); setLog(['> Let\'s try that again.']); }}
              className="mt-4 px-4 py-2 border border-purple-500/50 text-purple-400 text-xs uppercase tracking-widest hover:bg-purple-500/10 rounded transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
