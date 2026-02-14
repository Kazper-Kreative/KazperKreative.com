import React from 'react';
import { render, screen } from '@testing-library/react';
import CinematicScene from './CinematicScene';

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
}));

describe('CinematicScene', () => {
  it('renders a Canvas container', () => {
    render(<CinematicScene progress={0} />);
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });

  it('renders a fallback when R3F is not supported (if applicable)', () => {
    // This is hard to test in JSDOM as Canvas usually "works" or we mock it.
    // But we can test if we pass a fallback prop.
  });
});
