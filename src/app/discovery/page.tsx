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
    title: 'Identity Verification',
    description: 'Provide your name and organization to begin initialization.',
    fields: ['name', 'email', 'company'],
  },
  {
    id: 'spec',
    title: 'Project Specification',
    description: 'Select the operational unit and resource allocation range.',
    fields: ['projectType', 'budget'],
  },
  {
    id: 'scope',
    title: 'Mission Briefing',
    description: 'Describe the technical objectives and desired outcomes.',
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
        alert('Initialization failed. Please check network connectivity.');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('System error during initialization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'identity':
        return (
          <div className="space-y-6" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <label className="block text-purple-500 font-mono text-[10px] tracking-widest uppercase mb-2">// NAME</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-light"
                placeholder="OPERATIVE NAME"
                required
              />
            </div>
            <div suppressHydrationWarning>
              <label className="block text-purple-500 font-mono text-[10px] tracking-widest uppercase mb-2">// EMAIL_ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-light"
                placeholder="CONTACT_PROTOCOL@DOMAIN.COM"
                required
              />
            </div>
            <div suppressHydrationWarning>
              <label className="block text-purple-500 font-mono text-[10px] tracking-widest uppercase mb-2">// ORGANIZATION</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-light"
                placeholder="ENTITY_NAME (OPTIONAL)"
              />
            </div>
          </div>
        );
      case 'spec':
        return (
          <div className="space-y-6" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <label className="block text-purple-500 font-mono text-[10px] tracking-widest uppercase mb-2">// PROJECT_TYPE</label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-light appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>SELECT UNIT</option>
                <option value="game-dev">GAME_DEVELOPMENT</option>
                <option value="web-app">WEB_APPLICATION</option>
                <option value="qa">QA_VALIDATION</option>
                <option value="automation">AUTOMATION_PROTOCOL</option>
                <option value="other">OTHER_OPS</option>
              </select>
            </div>
            <div suppressHydrationWarning>
              <label className="block text-purple-500 font-mono text-[10px] tracking-widest uppercase mb-2">// BUDGET_ALLOCATION</label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-light appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>SELECT RANGE</option>
                <option value="under-5k">&lt; $5,000</option>
                <option value="5k-15k">$5,000 - $15,000</option>
                <option value="15k-50k">$15,000 - $50,000</option>
                <option value="50k-plus">$50,000+</option>
              </select>
            </div>
          </div>
        );
      case 'scope':
        return (
          <div className="space-y-6" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <label className="block text-purple-500 font-mono text-[10px] tracking-widest uppercase mb-2">// MISSION_DETAILS</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-light min-h-[200px] resize-none"
                placeholder="DESCRIBE_TECHNICAL_REQUIREMENTS..."
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full bg-zinc-950 border border-purple-500/30 rounded-2xl p-12 text-center shadow-2xl shadow-purple-900/20"
          >
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-purple-500/20">
              <ClientSafeIcon name="ExternalLink" size={32} className="text-purple-500" />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">System Initialized.</h1>
            <p className="text-zinc-400 mb-12 font-light leading-relaxed">
              Your discovery brief has been securely transmitted. Our engineering leads will review the operational parameters and contact you shortly.
            </p>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              Return to Control Center
            </Button>
          </motion.div>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#020205] pt-32 pb-24 px-4 relative overflow-hidden" suppressHydrationWarning>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" suppressHydrationWarning />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-[120px] pointer-events-none" suppressHydrationWarning />

        <div className="container mx-auto max-w-2xl relative z-10" suppressHydrationWarning>
          <div className="mb-12" suppressHydrationWarning>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-purple-500 font-mono text-xs tracking-[0.4em] uppercase mb-4"
              suppressHydrationWarning
            >
              // PROJECT_DISCOVERY_PORTAL
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6"
              suppressHydrationWarning
            >
              INITIALIZE OPS.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg font-light leading-relaxed"
              suppressHydrationWarning
            >
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </motion.p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 md:p-12 shadow-2xl relative" suppressHydrationWarning>
            {/* Step Indicators */}
            <div className="flex gap-2 mb-12" suppressHydrationWarning>
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1 flex-grow rounded-full transition-colors duration-500 ${
                    index <= currentStep ? 'bg-purple-500' : 'bg-zinc-800'
                  }`}
                  suppressHydrationWarning
                />
              ))}
            </div>

            <form onSubmit={handleSubmit} suppressHydrationWarning>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  suppressHydrationWarning
                >
                  <p className="text-zinc-500 text-sm mb-8 italic" suppressHydrationWarning>
                    {steps[currentStep].description}
                  </p>
                  
                  <div suppressHydrationWarning>
                    {renderStepContent()}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-12 pt-8 border-t border-zinc-900" suppressHydrationWarning>
                <button
                  type="button"
                  onClick={prevStep}
                  className={`text-zinc-500 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors ${
                    currentStep === 0 ? 'invisible' : 'visible'
                  }`}
                  suppressHydrationWarning
                >
                  &lt; BACK
                </button>

                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="button" 
                    variant="primary" 
                    onClick={nextStep}
                    disabled={steps[currentStep].fields.some(field => !(formData as any)[field])}
                  >
                    NEXT_STEP <ClientSafeIcon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isSubmitting || steps[currentStep].fields.some(field => !(formData as any)[field])}
                  >
                    {isSubmitting ? 'TRANSMITTING...' : 'START_MISSION'}
                  </Button>
                )}
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center" suppressHydrationWarning>
            <p className="text-zinc-600 font-mono text-[10px] tracking-widest uppercase" suppressHydrationWarning>
              // SECURE_TERMINAL_ENCRYPTION_ACTIVE
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
};

export default DiscoveryPage;
