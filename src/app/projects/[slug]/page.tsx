import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import PageWrapper from '@/components/layouts/PageWrapper';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  image: SanityImageSource;
  description: string;
  caseStudyUrl?: string;
  caseStudyContent?: any[];
}

async function getProject(slug: string): Promise<Project> {
  const query = `*[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    category,
    image,
    description,
    caseStudyUrl,
    caseStudyContent
  }`;
  const project = await client.fetch(query, { slug });
  return project;
}

export default async function ProjectCaseStudyPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);

  if (!project) {
    return <PageWrapper>Project not found</PageWrapper>;
  }

  const imageUrl = project.image ? urlFor(project.image).url() : '';

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white mb-6">{project.title}</h1>
        <p className="text-purple-300 text-xl mb-4">{project.category}</p>
        {imageUrl && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image src={imageUrl} alt={project.title} fill style={{ objectFit: 'cover' }} />
          </div>
        )}
        <p className="text-zinc-400 text-lg mb-8">{project.description}</p>

        {project.caseStudyContent && project.caseStudyContent.length > 0 && (
          <div className="prose prose-invert max-w-none text-zinc-300">
            <PortableText value={project.caseStudyContent} />
          </div>
        )}

        {project.caseStudyUrl && (
          <div className="mt-12 text-center">
            <Link href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline text-lg">
              View External Case Study
            </Link>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
