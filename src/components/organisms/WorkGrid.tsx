import React from 'react';
import ProjectCard from '@/components/molecules/ProjectCard';

const projectsData = [
  {
    title: "MechaVerse",
    category: "Metaverse Engineering",
    description: "Immersive Roblox Mech Combat. Custom UI & Monetization Systems.",
    imageUrl: "https://via.placeholder.com/1200x675/1a1a1a/cccccc?text=MechaVerse_Featured", // Placeholder
    caseStudyUrl: "https://www.roblox.com/games/80039313638354/MechaVerse",
    isFeatured: true,
  },
  {
    title: "SensorOps Contract",
    category: "QA Engineering",
    description: "Remote Quality Assurance & Automation Pipelines.",
    imageUrl: "https://via.placeholder.com/600x338/3a3a3a/cccccc?text=SensorOps_Contract", // Placeholder
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
