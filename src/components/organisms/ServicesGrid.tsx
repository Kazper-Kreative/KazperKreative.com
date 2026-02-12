import React from 'react';
import ServiceCard from '@/components/molecules/ServiceCard';

const servicesData = [
  {
    title: "Game Engineering",
    description: "Mastering complex game logic and robust system architectures with cutting-edge tools.",
    icon: "🎮", // Placeholder for actual icon, e.g., <RocketIcon /> from Lucide-React
    tags: ["Unreal Engine 5", "C++", "Multiplayer Replication"],
  },
  {
    title: "Roblox Metaverse",
    description: "Pioneering immersive experiences and innovative monetization in the Roblox ecosystem.",
    icon: "🌐", // Placeholder for actual icon
    tags: ["Luau", "MechaVerse Monetization", "High-Fidelity UI"],
  },
  {
    title: "QA & Validation",
    description: "Ensuring flawless performance and bug-free releases through rigorous testing protocols.",
    icon: "✅", // Placeholder for actual icon
    tags: ["Automated Testing", "Regression Pipelines", "Bug Tracking"],
  },
];

const ServicesGrid: React.FC = () => {
  return (
    <section className="container mx-auto px-4">
      <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-8 sm:mb-16">Our Expertise</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {servicesData.map((service, index) => (
          <ServiceCard
            key={index}
            title={service.title}
            description={service.description}
            icon={service.icon}
            tags={service.tags}
          />
        ))}
      </div>
    </section>
  );
};

export default ServicesGrid;
