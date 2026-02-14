import React from 'react';
import Navbar from '@/components/organisms/Navbar';
import BackToTopButton from '@/components/atoms/BackToTopButton';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className }) => {
  return (
    <div className={`min-h-screen bg-background text-foreground ${className || ''}`} suppressHydrationWarning>
      <Navbar />
      {children}
      <BackToTopButton />
    </div>
  );
};

export default PageWrapper;
