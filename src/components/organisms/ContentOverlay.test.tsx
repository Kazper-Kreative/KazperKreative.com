import React from 'react';
import { render, screen } from '@testing-library/react';
import ContentOverlay from './ContentOverlay';

describe('ContentOverlay', () => {
  it('renders Act 1 content when progress is between 0 and 0.3', () => {
    render(<ContentOverlay progress={0.1} />);
    expect(screen.getByText(/Technical Mastery/i)).toBeInTheDocument();
  });

  it('renders Act 2 content when progress is between 0.3 and 0.6', () => {
    render(<ContentOverlay progress={0.4} />);
    expect(screen.getByText(/Cinematic Immersion/i)).toBeInTheDocument();
  });

  it('renders Act 3 content when progress is between 0.6 and 0.9', () => {
    render(<ContentOverlay progress={0.7} />);
    expect(screen.getByText(/Precision Engineering/i)).toBeInTheDocument();
  });

  it('renders nothing when progress is outside defined ranges', () => {
    const { container } = render(<ContentOverlay progress={0.95} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
