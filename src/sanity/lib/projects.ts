import { client } from './client';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  image: SanityImageSource;
  description: string;
  caseStudyUrl?: string;
  caseStudyContent?: any[];
  technicalChallenge?: any[];
  solutionArchitecture?: any[];
  impactMetrics?: any[];
  gallery?: SanityImageSource[];
  interactiveMetadata?: string;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const query = `*[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    category,
    image,
    description,
    caseStudyUrl,
    caseStudyContent,
    technicalChallenge,
    solutionArchitecture,
    impactMetrics,
    "gallery": gallery[].asset->url,
    interactiveMetadata
  }`;
  return await client.fetch(query, { slug }, { useCdn: false });
}
