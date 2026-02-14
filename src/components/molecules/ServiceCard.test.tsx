import React from 'react';
import { render, screen } from '@testing-library/react';
import ServiceCard from './ServiceCard';

describe('ServiceCard', () => {
  const props = {
    title: 'Test Service',
    description: 'Test Description',
    icon: 'http://example.com/icon.png',
    tags: ['tag1', 'tag2'],
  };

  it('renders correctly with string icon', () => {
    render(<ServiceCard {...props} />);
    
    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByAltText('Test Service')).toBeInTheDocument();
  });

  it('renders correctly with ReactNode icon', () => {
    render(<ServiceCard {...props} icon={<span data-testid="test-icon">icon</span>} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
