import React from 'react';
import HeroSection from '@/components/organisms/HeroSection';
import PageWrapper from '@/components/layouts/PageWrapper';
import ServicesGrid from '@/components/organisms/ServicesGrid';
import WorkGrid from '@/components/organisms/WorkGrid';
import ContactCTA from '@/components/organisms/ContactCTA';
import Footer from '@/components/molecules/Footer';

const HomeTemplate: React.FC = () => {
  return (
    <PageWrapper>
      <HeroSection />
      <div className="py-12 sm:py-16 md:py-24">
        <ServicesGrid />
      </div>
      <div className="py-12 sm:py-16 md:py-24">
        <WorkGrid />
      </div>
      <div className="py-12 sm:py-16 md:py-24">
        <ContactCTA />
      </div>
      <Footer />
    </PageWrapper>
  );
};

export default HomeTemplate;
