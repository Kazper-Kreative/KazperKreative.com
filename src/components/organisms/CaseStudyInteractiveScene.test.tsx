import React from 'react';
import { render, screen } from '@testing-library/react';
import CaseStudyInteractiveScene from './CaseStudyInteractiveScene';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="r3f-canvas">{children}</div>,
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({ camera: { position: { set: jest.fn() } } })),
}));

// Mock @react-three/drei
jest.mock('@react-three/drei', () => ({
  PerspectiveCamera: ({ children }: { children: React.ReactNode }) => <div data-testid="perspective-camera">{children}</div>,
  Environment: () => <div data-testid="environment" />,
  Float: ({ children }: { children: React.ReactNode }) => <div data-testid="float">{children}</div>,
  PresentationControls: ({ children }: { children: React.ReactNode }) => <div data-testid="presentation-controls">{children}</div>,
  ContactShadows: () => <div data-testid="contact-shadows" />,
}));

// Mock usePerformanceConfig
jest.mock('@/components/utilities/usePerformanceConfig', () => ({
  usePerformanceConfig: () => ({
    reducedMotion: false,
    particleCount: 1000,
    show3D: true,
  }),
}));

describe('CaseStudyInteractiveScene', () => {
  it('renders a Canvas container', () => {
    render(<CaseStudyInteractiveScene />);
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });
});
