import React from 'react';
import Image from 'next/image';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string | React.ReactNode; // Flexible for Lucide-React, SVG, or Sanity Image URL
  tags: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, tags }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const renderIcon = () => {
    if (!mounted) return <div className="w-12 h-12 mb-4" />;
    
    if (typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/'))) {
      return (
        <div className="relative w-12 h-12 mb-4">
          <Image src={icon} alt={title} fill className="object-contain" />
        </div>
      );
    }
    return <div className="text-purple-400 mb-4 text-4xl">{icon}</div>;
  };

  return (
    <div 
      className="group relative p-4 sm:p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 transform h-full flex flex-col"
      suppressHydrationWarning
    >
      <div suppressHydrationWarning>{renderIcon()}</div>
      <h3 className="text-2xl font-bold text-white mb-2" suppressHydrationWarning>{title}</h3>
      <p className="text-zinc-400 text-base mb-4 flex-grow" suppressHydrationWarning>{description}</p>
      <div className="flex flex-wrap gap-2" suppressHydrationWarning>
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
