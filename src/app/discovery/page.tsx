"use client";

import React, { useState } from 'react';
import PageWrapper from '@/components/layouts/PageWrapper';
import Footer from '@/components/molecules/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/atoms/Button';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';

const steps = [
  {
    id: 'identity',
    title: 'About you',
    description: 'Tell us who we\'ll be working with.',
    fields: ['name', 'email', 'company'],
  },
  {
    id: 'spec',
    title: 'Project details',
    description: 'A quick sense of what you need and the budget.',
    fields: ['projectType', 'budget'],
  },
  {
    id: 'scope',
    title: 'Project description',
    description: 'What are you building and what does success look like?',
    fields: ['description'],
  },
];

const DiscoveryPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'identity':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-zinc-300 text-sm mb-2">Your name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-300 text-sm mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-300 text-sm mb-2">Company (optional)</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Company name"
              />
            </div>
          </div>
        );
      case 'spec':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-zinc-300 text-sm mb-2">What can we help with?</label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Select one</option>
                <option value="game-dev">Game development</option>
                <option value="web-app">Web application</option>
                <option value="qa">QA engineering</option>
                <option value="automation">Automation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 text-sm mb-2">Budget range</label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Select range</option>
                <option value="under-5k">Under $5,000</option>
                <option value="5k-15k">$5,000 – $15,000</option>
                <option value="15k-50k">$15,000 – $50,000</option>
                <option value="50k-plus">$50,000+</option>
              </select>
            </div>
          </div>
        );
      case 'scope':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-zinc-300 text-sm mb-2">Tell us about your project</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors min-h-[200px] resize-none"
                placeholder="What you're building, timeline, what success looks like..."
                required
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-[#020205] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-purple-500/20">
              <ClientSafeIcon name="Check" size={32} className="text-purple-400" />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Thanks — we&apos;ll be in touch.</h1>
            <p className="text-zinc-400 mb-12 leading-relaxed">
              We&apos;ve received your project brief. Expect a reply within one business day.
            </p>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              Back to home
            </Button>
          </motion.div>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#020205] pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-2xl relative z-10">
          <div className="mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6"
            >
              Start a project.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg leading-relaxed"
            >
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </motion.p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 md:p-12 shadow-2xl relative">
            {/* Step Indicators */}
            <div className="flex gap-2 mb-12">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-grow rounded-full transition-colors duration-500 ${
                    index <= currentStep ? 'bg-purple-500' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <p className="text-zinc-500 text-sm mb-8 italic">
                    {steps[currentStep].description}
                  </p>

                  <div>
                    {renderStepContent()}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-12 pt-8 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`text-zinc-500 text-sm hover:text-white transition-colors ${
                    currentStep === 0 ? 'invisible' : 'visible'
                  }`}
                >
                  &larr; Back
                </button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                    disabled={steps[currentStep].fields.some(field => !(formData as any)[field])}
                  >
                    Next <ClientSafeIcon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || steps[currentStep].fields.some(field => !(formData as any)[field])}
                  >
                    {isSubmitting ? 'Sending...' : 'Send brief'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
};

export default DiscoveryPage;
