import React from 'react';
import { render, screen } from '@testing-library/react';
import AgentCard from './AgentCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, whileHover, whileTap, whileInView, ...props }: any) => <div className={className} {...props}>{children}</div>,
    h3: ({ children, className, ...props }: any) => <h3 className={className} {...props}>{children}</h3>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock usePerformanceConfig
jest.mock('@/components/utilities/usePerformanceConfig', () => ({
  usePerformanceConfig: () => ({
    reducedMotion: false,
    particleCount: 1000,
    show3D: true,
  }),
}));

// Mock ClientSafeIcon
jest.mock('@/components/atoms/ClientSafeIcon', () => {
  return function MockIcon({ name, className }: any) {
    return <div data-testid="mock-icon" data-icon-name={name} className={className} />;
  };
});

describe('AgentCard', () => {
  const props = {
    name: 'Test Agent',
    pictureUrl: 'http://example.com/agent.png',
    role: 'Test Role',
    bio: 'Test Bio',
    upworkUrl: 'http://upwork.com/agent',
    specialties: ['AI', 'WebGL'],
  };

  it('renders correctly', () => {
    render(<AgentCard {...props} />);
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('Test Role')).toBeInTheDocument();
    expect(screen.getByText('Test Bio')).toBeInTheDocument();
    expect(screen.getByAltText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('WebGL')).toBeInTheDocument();
  });
});
