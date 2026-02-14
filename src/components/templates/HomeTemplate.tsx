import React from 'react';
import HeroSection from '@/components/organisms/HeroSection';
import PageWrapper from '@/components/layouts/PageWrapper';
import ServicesGrid, { Service } from '@/components/organisms/ServicesGrid';
import WorkGrid, { Project } from '@/components/organisms/WorkGrid';
import ContactSection from '@/components/organisms/ContactSection';
import ContactCTA from '@/components/organisms/ContactCTA';
import Footer from '@/components/molecules/Footer';
import Button from '@/components/atoms/Button';
import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

async function getProjects(): Promise<Project[]> {
  const query = `*[_type == "project"]{
    title,
    category,
    description,
    "imageUrl": image.asset->url,
    caseStudyUrl,
    "slug": slug.current
  }`;
  const projects = await client.fetch(query);
  return projects.map((project: any) => ({
    ...project,
    imageUrl: project.imageUrl ? urlFor(project.imageUrl).url() : '',
  }));
}

async function getServices(): Promise<Service[]> {
    const query = `*[_type == "service"]{
    title,
    description,
    "icon": icon.asset->url,
    tags
  }`;
  const data = await client.fetch(query);
  return data;
}

const HomeTemplate: React.FC = async () => {
  const projects = await getProjects();
  const services = await getServices();

  return (
    <PageWrapper>
      <HeroSection />
      <section className="bg-zinc-900/50 py-12 sm:py-16 md:py-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 break-words">MEET OUR ENGINEERS.</h2>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl px-4">
          Explore the profiles of our highly skilled AI/ML, WebGL, Full-stack, and QA engineers.
        </p>
        <Link href="/agents">
          <Button variant="primary" size="lg" className="relative group overflow-hidden">
            <span className="relative z-10">View Agent Profiles</span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </Link>
      </section>
      <div id="services" className="py-12 sm:py-16 md:py-24">
        <ServicesGrid services={services} />
      </div>
      <div id="work" className="py-12 sm:py-16 md:py-24">
        <WorkGrid projects={projects} />
      </div>
      <div id="contact" className="py-12 sm:py-16 md:py-24">
        <ContactSection />
      </div>
      <div id="legacy-contact" className="py-12 sm:py-16 md:py-24">
        <ContactCTA />
      </div>
      <Footer />
    </PageWrapper>
  );
};

export default HomeTemplate;
