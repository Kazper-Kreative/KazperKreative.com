import { render, screen } from '@testing-library/react';
import SquadRoster from './SquadRoster';

describe('SquadRoster', () => {
  const mockAgents = [
    { name: 'Mason', role: 'Lead Engineer', xp: 5000, rank: 'ELITE', pictureUrl: '/mason.webp', bio: 'Bio', upworkUrl: '#' },
    { name: 'Hunter', role: 'Architect', xp: 4500, rank: 'COMMANDER', pictureUrl: '/hunter.jpeg', bio: 'Bio', upworkUrl: '#' },
  ];

  it('renders the roster title', () => {
    render(<SquadRoster agents={[]} />);
    expect(screen.getByText(/THE ROSTER/i)).toBeInTheDocument();
  });

  it('renders agent cards with XP and Rank', () => {
    render(<SquadRoster agents={mockAgents as any} />);
    expect(screen.getByText(/Mason/i)).toBeInTheDocument();
    expect(screen.getByText(/Hunter/i)).toBeInTheDocument();
    expect(screen.getByText(/5000 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/ELITE/i)).toBeInTheDocument();
  });
});
