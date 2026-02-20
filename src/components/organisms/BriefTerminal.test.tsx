import { render, screen, fireEvent } from '@testing-library/react';
import BriefTerminal from './BriefTerminal';

jest.mock('@/hooks/useUISound', () => ({
  useUISound: () => ({
    playClick: jest.fn(),
    playSuccess: jest.fn(),
    playHover: jest.fn(),
  }),
}));

describe('BriefTerminal', () => {
  it('renders the initial prompt', () => {
    render(<BriefTerminal />);
    expect(screen.getByText(/INITIALIZE BRIEFING/i)).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<BriefTerminal />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Project' } });
    expect(input).toHaveValue('New Project');
  });

  it('moves to next step on Enter', () => {
    render(<BriefTerminal />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'My Awesome Project' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Check if it asks for the next piece of info (e.g., Description)
    const descriptionPrompts = screen.getAllByText(/PROJECT DESCRIPTION/i);
    expect(descriptionPrompts.length).toBeGreaterThan(0);
  });
});
