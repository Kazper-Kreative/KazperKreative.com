import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '@/components/atoms/Button';

interface ContactFormProps {
  onClose: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setResponseMessage(data.message);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
        setResponseMessage(data.message || 'An unknown error occurred.');
      }
    } catch (error) {
      setStatus('error');
      setResponseMessage('An error occurred while submitting the form.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-zinc-900/70 border border-purple-500/30 rounded-lg shadow-2xl w-full max-w-lg p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close contact form"
          suppressHydrationWarning
        >
          {mounted ? <X size={24} /> : <div className="w-6 h-6" />}
        </button>

        <h2 className="text-3xl font-bold text-white mb-6 text-center">Contact Us</h2>

        {status === 'success' ? (
          <div className="text-center">
            <p className="text-green-400">{responseMessage}</p>
            <div className="mt-6">
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-purple-300 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="Your Name"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-purple-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="Your message..."
                required
              ></textarea>
            </div>
            {status === 'error' && <p className="text-red-500 text-sm">{responseMessage}</p>}
            <div className="text-center pt-4">
              <Button type="submit" variant="primary" size="lg" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ContactForm;
