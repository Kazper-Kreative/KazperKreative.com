import React from 'react';
import Link from 'next/link';
import HeroSection from '@/components/organisms/HeroSection';
import PageWrapper from '@/components/layouts/PageWrapper';
import ServicesGrid, { Service } from '@/components/organisms/ServicesGrid';
import WorkGrid, { Project } from '@/components/organisms/WorkGrid';
import PricingBand from '@/components/organisms/PricingBand';
import ContactSection from '@/components/organisms/ContactSection';
import Footer from '@/components/molecules/Footer';
import Button from '@/components/atoms/Button';

interface HomeTemplateProps {
  initialProjects: Project[];
  initialServices: Service[];
}

const HomeTemplate: React.FC<HomeTemplateProps> = ({ initialProjects, initialServices }) => {
  return (
    <PageWrapper>
      <HeroSection />

      <section className="bg-zinc-900/50 py-12 sm:py-16 md:py-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 break-words">Meet the team.</h2>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl px-4">
          The engineers behind every Kazper Kreative build.
        </p>
        <Link href="/agents">
          <Button variant="primary" size="lg" className="relative group overflow-hidden">
            <span className="relative z-10">See the team</span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </Link>
      </section>

      <div id="services" className="py-12 sm:py-16 md:py-24">
        <ServicesGrid services={initialServices} />
      </div>

      <div id="work" className="py-12 sm:py-16 md:py-24">
        <WorkGrid projects={initialProjects} />
      </div>

      <div id="pricing" className="py-12 sm:py-16 md:py-24 bg-zinc-900/30">
        <PricingBand />
      </div>

      <div id="contact" className="py-12 sm:py-16 md:py-24">
        <ContactSection />
      </div>

      <Footer />
    </PageWrapper>
  );
};

export default HomeTemplate;
