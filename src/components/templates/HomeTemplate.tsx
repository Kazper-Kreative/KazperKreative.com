import React from 'react';
import HeroSection from '@/components/organisms/HeroSection';
import PageWrapper from '@/components/layouts/PageWrapper';
import ServicesGrid from '@/components/organisms/ServicesGrid';
import WorkGrid from '@/components/organisms/WorkGrid';
import ContactCTA from '@/components/organisms/ContactCTA';
import Footer from '@/components/molecules/Footer';
import Button from '@/components/atoms/Button';
import Link from 'next/link';

const HomeTemplate: React.FC = () => {
  return (
    <PageWrapper>
      <HeroSection />
      <section className="bg-zinc-900/50 py-12 sm:py-16 md:py-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 break-words">MEET OUR ENGINEERS.</h2>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl px-4">
          Explore the profiles of our highly skilled AI/ML, WebGL, Full-stack, and QA engineers.
        </p>
        <Link href="/agents" passHref>
          <Button variant="primary" size="lg" className="relative group overflow-hidden">
            <span className="relative z-10">View Agent Profiles</span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </Link>
      </section>
      <div id="services" className="py-12 sm:py-16 md:py-24">
        <ServicesGrid />
      </div>
      <div id="work" className="py-12 sm:py-16 md:py-24">
        <WorkGrid />
      </div>
      <div id="contact" className="py-12 sm:py-16 md:py-24">
        <ContactCTA />
      </div>
      <Footer />
    </PageWrapper>
  );
};

export default HomeTemplate;
