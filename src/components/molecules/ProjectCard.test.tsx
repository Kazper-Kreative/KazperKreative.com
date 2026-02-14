import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectCard from './ProjectCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, whileHover, whileTap, ...props }: any) => <div className={className} {...props}>{children}</div>,
    button: ({ children, className, whileHover, whileTap, ...props }: any) => <button className={className} {...props}>{children}</button>,
  },
}));

// Mock Button component
jest.mock('@/components/atoms/Button', () => {
  return function MockButton({ children, onClick, variant, size }: any) {
    return <button onClick={onClick}>{children}</button>;
  };
});

describe('ProjectCard', () => {
  const props = {
    title: 'Test Project',
    category: 'Test Category',
    description: 'Test Description',
    imageUrl: 'http://example.com/image.png',
    caseStudyUrl: 'http://example.com/casestudy',
    slug: 'test-project',
  };

  it('renders correctly', () => {
    render(<ProjectCard {...props} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByAltText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('View Case Study')).toBeInTheDocument();
  });
});
