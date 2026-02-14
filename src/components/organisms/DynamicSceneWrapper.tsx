"use client";

import dynamic from 'next/dynamic';

const CaseStudyInteractiveScene = dynamic(
  () => import('@/components/organisms/CaseStudyInteractiveScene'),
  { 
    ssr: false,
    loading: () => (
      <div className="relative aspect-video w-full bg-[#020205] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-purple-900/10 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }
);

interface DynamicSceneWrapperProps {
  metadata?: string;
}

const DynamicSceneWrapper: React.FC<DynamicSceneWrapperProps> = ({ metadata }) => {
  return <CaseStudyInteractiveScene metadata={metadata} />;
};

export default DynamicSceneWrapper;
