import HomeTemplate from "@/components/templates/HomeTemplate";
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { Project } from "@/components/organisms/WorkGrid";
import { Service } from "@/components/organisms/ServicesGrid";

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

export default async function Home() {
  const projects = await getProjects();
  const services = await getServices();
  
  return <HomeTemplate initialProjects={projects} initialServices={services} />;
}
