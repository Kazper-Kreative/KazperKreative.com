"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/organisms/HeroSection';
import PageWrapper from '@/components/layouts/PageWrapper';
import ServicesGrid, { Service } from '@/components/organisms/ServicesGrid';
import WorkGrid, { Project } from '@/components/organisms/WorkGrid';
import ContactSection from '@/components/organisms/ContactSection';
import ContactCTA from '@/components/organisms/ContactCTA';
import Footer from '@/components/molecules/Footer';
import Button from '@/components/atoms/Button';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const CinematicLanding = dynamic(() => import('@/components/organisms/CinematicLanding'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#020205] z-50" />
});

interface HomeTemplateProps {
  initialProjects: Project[];
  initialServices: Service[];
}

const HomeTemplate: React.FC<HomeTemplateProps> = ({ initialProjects, initialServices }) => {
  const [showHero3D, setShowHero3D] = useState(false);
  const [showCinematic3D, setShowCinematic3D] = useState(true);

  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Global scroll progress thresholds.
    // Adjust based on page length. Cinematic is 400vh.
    // If the page is ~800vh total, 0.5 would be the end of Cinematic.
    // We want Hero3D to show as Cinematic fades (0.8 local = ~0.4 global)
    if (latest > 0.3) {
      setShowHero3D(true);
    } else {
      setShowHero3D(false);
    }

    if (latest > 0.6) {
       setShowCinematic3D(false);
    } else {
       setShowCinematic3D(true);
    }
  });

  return (
    <PageWrapper>
      <CinematicLanding isVisible={showCinematic3D} />
      <HeroSection isVisible={showHero3D} />
      <section className="bg-zinc-900/50 py-12 sm:py-16 md:py-24 flex flex-col items-center justify-center text-center px-4" suppressHydrationWarning>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 break-words" suppressHydrationWarning>MEET OUR ENGINEERS.</h2>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl px-4" suppressHydrationWarning>
          Explore the profiles of our highly skilled AI/ML, WebGL, Full-stack, and QA engineers.
        </p>
        <Link href="/agents" suppressHydrationWarning>
          <Button variant="primary" size="lg" className="relative group overflow-hidden" suppressHydrationWarning>
            <span className="relative z-10" suppressHydrationWarning>View Agent Profiles</span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" suppressHydrationWarning></span>
          </Button>
        </Link>
      </section>
      <div id="services" className="py-12 sm:py-16 md:py-24" suppressHydrationWarning>
        <ServicesGrid services={initialServices} />
      </div>
      <div id="work" className="py-12 sm:py-16 md:py-24" suppressHydrationWarning>
        <WorkGrid projects={initialProjects} />
      </div>
      <div id="contact" className="py-12 sm:py-16 md:py-24" suppressHydrationWarning>
        <ContactSection />
      </div>
      <div id="legacy-contact" className="py-12 sm:py-16 md:py-24" suppressHydrationWarning>
        <ContactCTA />
      </div>
      <Footer />
    </PageWrapper>
  );
};

export default HomeTemplate;
