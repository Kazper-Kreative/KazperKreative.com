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
      <main className="pt-20 sm:pt-24">
        {children}
      </main>
      <BackToTopButton />
    </div>
  );
};

export default PageWrapper;
