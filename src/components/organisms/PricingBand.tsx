import React from 'react';
import Link from 'next/link';
import Button from '@/components/atoms/Button';

export default function PricingBand() {
  return (
    <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-purple-400 text-sm tracking-widest uppercase mb-4">Pricing</p>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Engagements start at $5,000.
        </h2>
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
          Fixed-scope sprints and longer retainers both welcome. Bring us a clear brief
          and we&apos;ll come back with a concrete plan within one business day.
        </p>
        <Link href="/discovery">
          <Button variant="primary" size="lg">
            Start a project
          </Button>
        </Link>
      </div>
    </section>
  );
}
