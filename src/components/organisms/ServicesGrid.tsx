import React from 'react';
import ServiceCard from '@/components/molecules/ServiceCard';

export interface Service {
  title: string;
  description: string;
  icon: string; // Or a more specific type if you have one
  tags: string[];
}

interface ServicesGridProps {
  services: Service[];
}

const ServicesGrid: React.FC<ServicesGridProps> = ({ services }) => {
  return (
    <section className="container mx-auto px-4">
      <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-8 sm:mb-16">Our Expertise</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
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
