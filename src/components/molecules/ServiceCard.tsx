import React from 'react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode; // Flexible for Lucide-React, SVG, or other React components
  tags: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, tags }) => {
  return (
    <div className="group relative p-4 sm:p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 transform">
      <div className="text-purple-400 mb-4 text-4xl">{icon}</div> {/* Icon placeholder */}
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-base mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 text-sm bg-zinc-700/50 text-zinc-300 rounded-full border border-zinc-600 group-hover:border-purple-400/30 transition-colors duration-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ServiceCard;
