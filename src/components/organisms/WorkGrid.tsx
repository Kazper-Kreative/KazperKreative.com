import React from 'react';
import ProjectCard from '@/components/molecules/ProjectCard';

const projectsData = [
  {
    title: "MechaVerse",
    category: "Metaverse Engineering",
    description: "Immersive Roblox Mech Combat. Custom UI & Monetization Systems.",
    imageUrl: "/images/mechaverse.png", // Updated path
    caseStudyUrl: "https://www.roblox.com/games/80039313638354/MechaVerse",
    isFeatured: true,
  },
  {
    title: "SensorOps Contract",
    category: "QA Engineering",
    description: "Remote Quality Assurance & Automation Pipelines.",
    imageUrl: "/images/sensorops.jpeg", // Updated path
    caseStudyUrl: "https://www.linkedin.com/company/sensorops/posts/?feedView=all",
  },
];

const WorkGrid: React.FC = () => {
  return (
    <section className="container mx-auto px-4">
      <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-8 sm:mb-16">DEPLOYED EXPERIENCES.</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projectsData.map((project, index) => (
          <div key={index} className={project.isFeatured ? "md:col-span-2" : ""}>
            <ProjectCard
              title={project.title}
              category={project.category}
              description={project.description}
              imageUrl={project.imageUrl}
              caseStudyUrl={project.caseStudyUrl}
              isFeatured={project.isFeatured}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkGrid;
