import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const JoinPage: React.FC = () => {
  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <header className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>
      </header>
      <main className="flex-grow flex flex-col">
        <iframe
          src="https://lapis-elf-34a.notion.site/embed/306453d752a780e8b9effbbf86df8620"
          className="w-full flex-grow border-none"
          title="Talent Application Form"
        />
      </main>
    </div>
  );
};

export default JoinPage;
