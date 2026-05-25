import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import PageWrapper from '@/components/layouts/PageWrapper';
import ApplicantTerminal from '@/components/organisms/ApplicantTerminal';

export const metadata: Metadata = {
  title: 'Join the team | Kazper Kreative LLC',
  description: 'Apply to work with Kazper Kreative as a contractor.',
};

export default function JoinPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Join the team
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Send us a quick intro. We review every submission and reply within a week.
          </p>
        </div>

        <ApplicantTerminal />

        <div className="max-w-2xl mx-auto text-center mt-12">
          <Link
            href="/agents"
            className="text-zinc-500 hover:text-purple-400 text-xs uppercase tracking-widest transition-colors"
          >
            &larr; Back to the team
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
