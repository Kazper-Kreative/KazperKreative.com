import { getProjectBySlug } from '@/sanity/lib/projects';
import PageWrapper from '@/components/layouts/PageWrapper';
import CaseStudyHeader from '@/components/molecules/CaseStudyHeader';
import TechnicalBlock from '@/components/molecules/TechnicalBlock';
import ProjectGallery from '@/components/molecules/ProjectGallery';
import Footer from '@/components/molecules/Footer';
import Link from 'next/link';
import Button from '@/components/atoms/Button';
import { urlFor } from '@/sanity/lib/image';
import ClientSafeImage from '@/components/atoms/ClientSafeImage';
import DynamicSceneWrapper from '@/components/organisms/DynamicSceneWrapper';
import ClientSafeIcon from '@/components/atoms/ClientSafeIcon';
import ProjectTracker from '@/components/utilities/ProjectTracker';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  
  return {
    title: `${project?.title || 'Project'} | Case Study | Kazper Kreative LLC`,
    description: project?.description || 'Detailed technical review of a Kazper Kreative project.',
  };
}

export default async function ProjectCaseStudyPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
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

  const mainImageUrl = project.image ? urlFor(project.image).url() : null;

  return (
    <PageWrapper>
      <ProjectTracker slug={slug} />
      <div className="bg-[#020205] min-h-screen" suppressHydrationWarning>
        <CaseStudyHeader 
          title={project.title} 
          category={project.category} 
          description={project.description} 
        />

        {mainImageUrl && (
          <div className="container mx-auto max-w-5xl px-4 mb-24" suppressHydrationWarning>
            <Link 
              href={project.caseStudyUrl || '#'} 
              target={project.caseStudyUrl ? "_blank" : undefined}
              rel={project.caseStudyUrl ? "noopener noreferrer" : undefined}
              className={`block relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-purple-900/20 group ${!project.caseStudyUrl ? 'pointer-events-none' : ''}`}
              suppressHydrationWarning
            >
              <ClientSafeImage 
                src={mainImageUrl} 
                alt={project.title} 
                fill 
                style={{ objectFit: 'cover' }} 
                priority
                className="transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" suppressHydrationWarning />
              
              {project.caseStudyUrl && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0" suppressHydrationWarning>
                  <Button variant="primary" size="lg" className="pointer-events-none">
                    Visit Live Project <ClientSafeIcon name="ExternalLink" size={18} className="ml-2" />
                  </Button>
                </div>
              )}
            </Link>
          </div>
        )}

        <div className="container mx-auto max-w-5xl px-4 mb-24" suppressHydrationWarning>
          <DynamicSceneWrapper metadata={project.interactiveMetadata} />
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-12" suppressHydrationWarning>
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

        <div className="container mx-auto max-w-5xl px-4 py-24 text-center" suppressHydrationWarning>
          <div className="h-px w-full bg-zinc-900 mb-12" suppressHydrationWarning />
          <h3 className="text-2xl font-bold text-white mb-8" suppressHydrationWarning>Ready to deploy your vision?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" suppressHydrationWarning>
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
