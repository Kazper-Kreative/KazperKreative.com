import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import PageWrapper from '@/components/layouts/PageWrapper';
import ApplicantTerminal from '@/components/organisms/ApplicantTerminal';

export const metadata: Metadata = {
  title: 'Join the Roster | Kazper Kreative LLC',
  description: 'Submit your dossier to join the Kazper Kreative engineering roster.',
};

export default function JoinPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-purple-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-4">
            // RECRUITMENT_PROTOCOL
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
            Join the Roster
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Submit your dossier through our secure applicant terminal.
            All submissions are reviewed by senior operatives.
          </p>
        </div>

        <ApplicantTerminal />

        <div className="max-w-2xl mx-auto text-center mt-12">
          <Link
            href="/agents"
            className="text-zinc-500 hover:text-purple-400 text-xs font-mono uppercase tracking-widest transition-colors"
          >
            &larr; Back to Squad Roster
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
