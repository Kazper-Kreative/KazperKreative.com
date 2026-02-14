import React from 'react';
import { render, screen } from '@testing-library/react';
import AgentsGrid from './AgentsGrid';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, whileHover, whileTap, whileInView, ...props }: any) => <div className={className} {...props}>{children}</div>,
    section: ({ children, className, whileHover, whileTap, whileInView, ...props }: any) => <section className={className} {...props}>{children}</section>,
    p: ({ children, className, whileHover, whileTap, whileInView, ...props }: any) => <p className={className} {...props}>{children}</p>,
    h2: ({ children, className, whileHover, whileTap, whileInView, ...props }: any) => <h2 className={className} {...props}>{children}</h2>,
  },
}));

// Mock usePerformanceConfig
jest.mock('@/components/utilities/usePerformanceConfig', () => ({
  usePerformanceConfig: () => ({
    reducedMotion: false,
    particleCount: 1000,
    show3D: true,
  }),
}));

describe('AgentsGrid', () => {
  const mockAgents = [
    {
      name: 'Agent One',
      pictureUrl: 'http://example.com/1.png',
      role: 'Role One',
      bio: 'Bio One',
      upworkUrl: 'http://upwork.com/1',
      specialties: ['Tag1'],
    },
    {
      name: 'Agent Two',
      pictureUrl: 'http://example.com/2.png',
      role: 'Role Two',
      bio: 'Bio Two',
      upworkUrl: 'http://upwork.com/2',
      specialties: ['Tag2'],
    },
  ];

  it('renders correctly with a list of agents', () => {
    render(<AgentsGrid agents={mockAgents} />);
    
    expect(screen.getByText('Agent One')).toBeInTheDocument();
    expect(screen.getByText('Agent Two')).toBeInTheDocument();
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
  });
});
