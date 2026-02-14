import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, className }: any) => <nav className={className}>{children}</nav>,
    a: ({ children, className, whileHover, whileTap, ...props }: any) => <a className={className} {...props}>{children}</a>,
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    span: ({ children, className, whileHover, whileTap, ...props }: any) => <span className={className} {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('Navbar', () => {
  it('renders the logo and links', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<Navbar />);
    
    expect(screen.getByText('KAZPER KREATIVE')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
