import React from 'react';
import { render, screen } from '@testing-library/react';
import TechnicalBlock from './TechnicalBlock';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    h2: ({ children, className, ...props }: any) => <h2 className={className} {...props}>{children}</h2>,
  },
}));

// Mock PortableText
jest.mock('@portabletext/react', () => ({
  PortableText: ({ value }: any) => <div data-testid="portable-text">{JSON.stringify(value)}</div>,
}));

describe('TechnicalBlock', () => {
  const props = {
    title: 'The Challenge',
    content: [{ _type: 'block', children: [{ _text: 'Test content' }] }],
    label: 'CHALLENGE_REPORT',
  };

  it('renders correctly', () => {
    render(<TechnicalBlock {...props} />);
    
    expect(screen.getByText('The Challenge')).toBeInTheDocument();
    expect(screen.getByText(/CHALLENGE_REPORT/i)).toBeInTheDocument();
    expect(screen.getByTestId('portable-text')).toBeInTheDocument();
  });
});
