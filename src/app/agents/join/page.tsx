import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Button from '@/components/atoms/Button';

const JoinPage: React.FC = () => {
  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <header className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Talent Application</h1>
        <p className="text-zinc-400 mb-8 max-w-xl">
          You will be redirected to our secure Notion portal to complete your application. Please ensure you have your portfolio and resume ready.
        </p>
        <Link href="https://lapis-elf-34a.notion.site/306453d752a780e8b9effbbf86df8620" passHref legacyBehavior>
          <a target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
            <Button variant="primary" size="lg">
              Proceed to Application <ExternalLink size={20} className="ml-2" />
            </Button>
          </a>
        </Link>
      </main>
    </div>
  );
};

export default JoinPage;
