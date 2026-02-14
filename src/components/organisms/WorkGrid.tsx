import React from 'react';
import ProjectCard from '@/components/molecules/ProjectCard';

export interface Project {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  caseStudyUrl: string;
  slug: string; // Add slug for internal linking
}

interface WorkGridProps {
  projects: Project[];
}

const WorkGrid: React.FC<WorkGridProps> = ({ projects }) => {
  return (
    <section className="container mx-auto px-4">
      <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-8 sm:mb-16">DEPLOYED EXPERIENCES.</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            title={project.title}
            category={project.category}
            description={project.description}
            imageUrl={project.imageUrl}
            caseStudyUrl={project.caseStudyUrl}
            slug={project.slug} // Pass the slug to ProjectCard
          />
        ))}
      </motion.div>
    </section>
  );
};

export default WorkGrid;
