"use client";

import { useEffect } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';

interface ProjectTrackerProps {
  slug: string;
}

const ProjectTracker: React.FC<ProjectTrackerProps> = ({ slug }) => {
  const trackProjectView = useGamificationStore((state) => state.trackProjectView);

  useEffect(() => {
    if (slug) {
      trackProjectView(slug);
    }
  }, [slug, trackProjectView]);

  return null;
};

export default ProjectTracker;
