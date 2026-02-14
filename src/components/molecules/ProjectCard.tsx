"use client";

import React from 'react';
import Image from 'next/image';
import Button from '@/components/atoms/Button';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  caseStudyUrl: string; // Still passed, but not used for the main link
  slug: string; // Add slug for internal linking
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  category,
  description,
  imageUrl,
  // caseStudyUrl, // We keep this if it's meant to be displayed *within* the case study page
  slug,
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href={`/projects/${slug}`}
      className="group relative overflow-hidden rounded-lg shadow-lg bg-zinc-900/70 block h-full transition-all duration-500"
      suppressHydrationWarning
    >
      <motion.div
        whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)" }}
        className="h-full will-change-transform"
      >
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }} suppressHydrationWarning> {/* 16:9 Aspect Ratio */}
          {mounted && (
            <Image
              src={imageUrl}
              alt={title}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-105 will-change-transform"
            />
          )}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" suppressHydrationWarning></div> {/* Dark overlay */}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-black/80 text-white" suppressHydrationWarning>
          <p className="text-sm text-purple-400 font-semibold mb-1" suppressHydrationWarning>{category}</p>
          <h3 className="text-2xl font-bold mb-2" suppressHydrationWarning>{title}</h3>
          <p className="text-zinc-300 text-base mb-4 line-clamp-2" suppressHydrationWarning>{description}</p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" suppressHydrationWarning>
            <Button variant="primary" size="md">
              View Case Study
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProjectCard;
