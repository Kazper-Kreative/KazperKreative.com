import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock useUISound
jest.mock('@/hooks/useUISound', () => ({
  useUISound: () => ({
    playSound: jest.fn(),
  }),
}));

// Mock useGamificationStore
jest.mock('@/store/useGamificationStore', () => {
  const mockState = {
    xp: 0,
    level: 1,
    badges: [],
    unlockedBadges: [],
    lastUnlockedBadgeId: null,
    unlockBadge: jest.fn(),
    clearLastUnlockedBadge: jest.fn(),
  };
  return {
    useGamificationStore: jest.fn((selector) => selector ? selector(mockState) : mockState),
  };
});

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, className }: any) => <nav className={className}>{children}</nav>,
    a: ({ children, className, whileHover, whileTap, ...props }: any) => <a className={className} {...props}>{children}</a>,
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    span: ({ children, className, whileHover, whileTap, ...props }: any) => <span className={className} {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: jest.fn(() => ({
    scrollYProgress: {
      get: () => 0,
      on: jest.fn(),
    },
  })),
  useMotionValueEvent: jest.fn(),
  useSpring: jest.fn((val) => val),
  useTransform: jest.fn((val) => val),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ city: 'TEST CITY', region_code: 'TC' }),
  })
) as jest.Mock;

describe('Navbar', () => {
  it('renders the logo and links', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<Navbar />);
    
    expect(screen.getByText('KAZPER_KREATIVE')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
