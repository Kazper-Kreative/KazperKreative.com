import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectGallery from './ProjectGallery';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

describe('ProjectGallery', () => {
  const images = ['http://example.com/1.png', 'http://example.com/2.png'];

  it('renders correctly with images', () => {
    render(<ProjectGallery images={images} title="Test Project" />);
    
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByAltText('Test Project gallery image 0')).toBeInTheDocument();
  });
});
