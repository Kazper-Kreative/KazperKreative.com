"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ images, title }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <div className="py-24 px-4 bg-zinc-950/50" suppressHydrationWarning>
      <div className="container mx-auto" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" suppressHydrationWarning>
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 group"
              suppressHydrationWarning
            >
              {mounted && (
                <Image
                  src={image}
                  alt={`${title} gallery image ${index}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" suppressHydrationWarning />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectGallery;
