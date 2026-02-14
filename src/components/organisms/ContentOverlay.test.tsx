import React from 'react';
import { render, screen } from '@testing-library/react';
import ContentOverlay from './ContentOverlay';

describe('ContentOverlay', () => {
  it('renders Act 1 content when progress is between 0.05 and 0.25', () => {
    render(<ContentOverlay progress={0.1} />);
    expect(screen.getByText(/Technical/i)).toBeInTheDocument();
    expect(screen.getByText(/Mastery/i)).toBeInTheDocument();
  });

  it('renders Act 2 content when progress is between 0.35 and 0.55', () => {
    render(<ContentOverlay progress={0.4} />);
    expect(screen.getByText(/Cinematic/i)).toBeInTheDocument();
    expect(screen.getByText(/Immersion/i)).toBeInTheDocument();
  });

  it('renders Act 3 content when progress is between 0.65 and 0.85', () => {
    render(<ContentOverlay progress={0.7} />);
    expect(screen.getByText(/Precision/i)).toBeInTheDocument();
    expect(screen.getByText(/Engineering/i)).toBeInTheDocument();
  });

  it('renders nothing when progress is outside defined ranges', () => {
    const { container } = render(<ContentOverlay progress={0.95} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
