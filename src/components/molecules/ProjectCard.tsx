import React from 'react';
import Image from 'next/image';
import Button from '@/components/atoms/Button';
import Link from 'next/link';

interface ProjectCardProps {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  caseStudyUrl: string;
  isFeatured?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  category,
  description,
  imageUrl,
  caseStudyUrl,
  isFeatured = false,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg bg-zinc-900/70">
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div> {/* Dark overlay */}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-black/70 backdrop-blur-md text-white">
        <p className="text-sm text-purple-400 font-semibold mb-1">{category}</p>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-zinc-300 text-base mb-4">{description}</p>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link href={caseStudyUrl} passHref>
            <Button variant="primary" size="md">
              View Case Study
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
