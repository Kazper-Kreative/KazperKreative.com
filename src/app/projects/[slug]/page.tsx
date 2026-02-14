import { getProjectBySlug } from '@/sanity/lib/projects';
import PageWrapper from '@/components/layouts/PageWrapper';
import CaseStudyHeader from '@/components/molecules/CaseStudyHeader';
import TechnicalBlock from '@/components/molecules/TechnicalBlock';
import ProjectGallery from '@/components/molecules/ProjectGallery';
import Footer from '@/components/molecules/Footer';
import Link from 'next/link';
import Button from '@/components/atoms/Button';

export default async function ProjectCaseStudyPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">ENTRY_NOT_FOUND</h1>
            <Link href="/#work">
              <Button variant="secondary">Return to Registry</Button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="bg-[#020205] min-h-screen">
        <CaseStudyHeader 
          title={project.title} 
          category={project.category} 
          description={project.description} 
        />

        <div className="container mx-auto max-w-5xl px-4 py-12">
          {project.technicalChallenge && project.technicalChallenge.length > 0 && (
            <TechnicalBlock 
              title="The Challenge" 
              content={project.technicalChallenge} 
              label="CHALLENGE_LOG" 
            />
          )}

          {project.solutionArchitecture && project.solutionArchitecture.length > 0 && (
            <TechnicalBlock 
              title="Architecture & Execution" 
              content={project.solutionArchitecture} 
              label="EXECUTION_LOG" 
            />
          )}

          {project.impactMetrics && project.impactMetrics.length > 0 && (
            <TechnicalBlock 
              title="Operational Impact" 
              content={project.impactMetrics} 
              label="METRICS_LOG" 
            />
          )}
        </div>

        {project.gallery && project.gallery.length > 0 && (
          <ProjectGallery images={project.gallery as any} title={project.title} />
        )}

        <div className="container mx-auto max-w-5xl px-4 py-24 text-center">
          <div className="h-px w-full bg-zinc-900 mb-12" />
          <h3 className="text-2xl font-bold text-white mb-8">Ready to deploy your vision?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact">
              <Button size="lg" variant="primary">Initialize Partnership</Button>
            </Link>
            <Link href="/#work">
              <Button size="lg" variant="secondary">Back to Work</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
