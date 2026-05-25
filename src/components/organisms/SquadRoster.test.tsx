import { render, screen } from '@testing-library/react';
import SquadRoster from './SquadRoster';

describe('SquadRoster', () => {
  const mockAgents = [
    { name: 'Mason', role: 'Lead Engineer', xp: 5000, rank: 'ELITE', pictureUrl: '/mason.webp', bio: 'Bio', upworkUrl: '#' },
    { name: 'Hunter', role: 'Architect', xp: 4500, rank: 'COMMANDER', pictureUrl: '/hunter.jpeg', bio: 'Bio', upworkUrl: '#' },
  ];

  it('renders the section title', () => {
    render(<SquadRoster agents={[]} />);
    expect(screen.getByText(/The team/i)).toBeInTheDocument();
  });

  it('renders agent cards for each agent', () => {
    render(<SquadRoster agents={mockAgents as any} />);
    expect(screen.getByText(/Mason/i)).toBeInTheDocument();
    expect(screen.getByText(/Hunter/i)).toBeInTheDocument();
  });
});
