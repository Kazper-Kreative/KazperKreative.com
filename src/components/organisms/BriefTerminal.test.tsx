import { render, screen, fireEvent } from '@testing-library/react';
import BriefTerminal from './BriefTerminal';

jest.mock('@/hooks/useUISound', () => ({
  useUISound: () => ({
    playSound: jest.fn(),
  }),
}));

describe('BriefTerminal', () => {
  it('renders the initial prompt', () => {
    render(<BriefTerminal />);
    expect(screen.getByText(/Brief:/i)).toBeInTheDocument();
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

    // Check if it asks for the next piece of info (the "What we're building" step)
    const descriptionPrompts = screen.getAllByText(/What we're building/i);
    expect(descriptionPrompts.length).toBeGreaterThan(0);
  });
});
