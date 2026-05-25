import { getProjectBySlug } from '@/sanity/lib/projects';
import { client } from '@/sanity/lib/client';
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

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateStaticParams() {
  const slugs: { slug: string }[] = await client.fetch(
    `*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`
  );
  return slugs.map((s) => ({ slug: s.slug }));
}

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
            <h1 className="text-4xl font-bold text-white mb-8">Project not found</h1>
            <Link href="/#work">
              <Button variant="secondary">Back to work</Button>
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
      <div className="bg-[#020205] min-h-screen">
        <CaseStudyHeader 
          title={project.title} 
          category={project.category} 
          description={project.description} 
        />

        {mainImageUrl && (
          <div className="container mx-auto max-w-5xl px-4 mb-24">
            <Link 
              href={project.caseStudyUrl || '#'} 
              target={project.caseStudyUrl ? "_blank" : undefined}
              rel={project.caseStudyUrl ? "noopener noreferrer" : undefined}
              className={`block relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-purple-900/20 group ${!project.caseStudyUrl ? 'pointer-events-none' : ''}`}
             
            >
              <ClientSafeImage 
                src={mainImageUrl} 
                alt={project.title} 
                fill 
                style={{ objectFit: 'cover' }} 
                priority
                className="transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              
              {project.caseStudyUrl && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <Button variant="primary" size="lg" className="pointer-events-none">
                    Visit Live Project <ClientSafeIcon name="ExternalLink" size={18} className="ml-2" />
                  </Button>
                </div>
              )}
            </Link>
          </div>
        )}

        <div className="container mx-auto max-w-5xl px-4 mb-24">
          <DynamicSceneWrapper metadata={project.interactiveMetadata} />
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-12">
          {project.technicalChallenge && project.technicalChallenge.length > 0 && (
            <TechnicalBlock
              title="The challenge"
              content={project.technicalChallenge}
              label="Challenge"
            />
          )}

          {project.solutionArchitecture && project.solutionArchitecture.length > 0 && (
            <TechnicalBlock
              title="Architecture & execution"
              content={project.solutionArchitecture}
              label="Execution"
            />
          )}

          {project.impactMetrics && project.impactMetrics.length > 0 && (
            <TechnicalBlock
              title="Impact"
              content={project.impactMetrics}
              label="Impact"
            />
          )}
        </div>

        {project.gallery && project.gallery.length > 0 && (
          <ProjectGallery images={project.gallery as any} title={project.title} />
        )}

        <div className="container mx-auto max-w-5xl px-4 py-24 text-center">
          <div className="h-px w-full bg-zinc-900 mb-12" />
          <h3 className="text-2xl font-bold text-white mb-8">Have a project in mind?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/start">
              <Button size="lg" variant="primary">Start a project</Button>
            </Link>
            <Link href="/#work">
              <Button size="lg" variant="secondary">Back to work</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
