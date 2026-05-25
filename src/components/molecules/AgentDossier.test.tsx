import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentDossier from './AgentDossier';
import { Agent } from '@/types/agent';

const mockAgent: Agent = {
  name: 'Test Agent',
  role: 'Test Role',
  bio: 'Test Bio',
  pictureUrl: '/test.jpg',
  upworkUrl: 'https://upwork.com/test',
  rank: 'SR. AGENT',
  xp: 1500,
  status: 'ACTIVE',
  specialties: ['React', 'Next.js']
};

describe('AgentDossier', () => {
  it('should not render when isOpen is false', () => {
    const { queryByText } = render(
      <AgentDossier agent={mockAgent} isOpen={false} onClose={() => {}} />
    );
    expect(queryByText('Test Agent')).not.toBeInTheDocument();
  });

  it('should render agent details when isOpen is true', () => {
    render(<AgentDossier agent={mockAgent} isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('Test Role')).toBeInTheDocument();
    expect(screen.getByText('Test Bio')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(<AgentDossier agent={mockAgent} isOpen={true} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});
