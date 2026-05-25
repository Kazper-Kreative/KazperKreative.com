"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUISound } from '@/hooks/useUISound';

const STEPS = [
  { id: 'title', label: 'Project title', placeholder: 'Working title...' },
  { id: 'description', label: 'What we\'re building', placeholder: 'A few sentences is plenty.' },
  { id: 'contact', label: 'Email', placeholder: 'you@company.com' },
];

export default function BriefTerminal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>(['> Ready when you are.', '> What are we building?']);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { playSound } = useUISound();

  const step = STEPS[currentStep];

  const submitBrief = async (finalValues: Record<string, string>) => {
    setIsSubmitting(true);
    setHistory(prev => [...prev, '> Sending...']);

    try {
      const response = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalValues),
      });

      if (response.ok) {
        playSound('success');
        setHistory(prev => [...prev, '> Thanks — we\'ll be in touch.']);
      } else {
        setHistory(prev => [...prev, '> Send failed. Please try again.']);
      }
    } catch {
      setHistory(prev => [...prev, '> Something went wrong. Try again?']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && !isSubmitting) {
      playSound('click');
      const newHistory = [...history, `> ${step.label}: ${inputValue}`];

      const newValues = { ...values, [step.id]: inputValue };
      setValues(newValues);
      setInputValue('');

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
        setHistory([...newHistory, `> ${STEPS[currentStep + 1].label}?`]);
      } else {
        setHistory(newHistory);
        submitBrief(newValues);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl bg-black/80 border border-emerald-500/30 p-6 font-mono text-emerald-500 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.1)]">
      <div className="mb-4 h-64 overflow-y-auto space-y-1 text-sm custom-scrollbar">
        {history.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {line}
          </motion.div>
        ))}
      </div>

      <div className="border-t border-emerald-500/30 pt-4">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">{isSubmitting ? 'Sending...' : 'Brief:'}</span>
          {!isSubmitting && <span className="text-emerald-300/70">{step.label}</span>}
        </div>
        {!isSubmitting && (
          <div className="flex items-center gap-2 mt-2">
            <span>{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={step.placeholder}
              className="flex-1 bg-transparent border-none outline-none text-emerald-400 placeholder:text-emerald-900"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
