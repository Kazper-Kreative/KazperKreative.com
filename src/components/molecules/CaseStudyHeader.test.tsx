import React from 'react';
import { render, screen } from '@testing-library/react';
import CaseStudyHeader from './CaseStudyHeader';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    h1: ({ children, className, ...props }: any) => <h1 className={className} {...props}>{children}</h1>,
    p: ({ children, className, ...props }: any) => <p className={className} {...props}>{children}</p>,
  },
}));

describe('CaseStudyHeader', () => {
  const props = {
    title: 'Test Project',
    category: 'Game Dev',
    description: 'A test project description.',
  };

  it('renders correctly', () => {
    render(<CaseStudyHeader {...props} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText(/Game Dev/i)).toBeInTheDocument();
    expect(screen.getByText('A test project description.')).toBeInTheDocument();
  });
});
