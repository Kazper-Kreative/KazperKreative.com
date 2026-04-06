import { render, screen, fireEvent } from '@testing-library/react';
import ApplicantTerminal from './ApplicantTerminal';

jest.mock('framer-motion', () => ({
  motion: {
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/hooks/useUISound', () => ({
  useUISound: () => ({ playSound: jest.fn() }),
}));

jest.mock('@/components/atoms/ClientSafeIcon', () => {
  return function MockIcon({ name }: { name: string }) {
    return <span data-testid={`icon-${name}`}>{name}</span>;
  };
});

describe('ApplicantTerminal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders the terminal with initial prompt', () => {
    render(<ApplicantTerminal />);
    expect(screen.getByText(/APPLICANT_TERMINAL \/\/ KAZPER_KREATIVE/)).toBeInTheDocument();
    expect(screen.getByText(/FULL_NAME/)).toBeInTheDocument();
  });

  it('advances to next step on Enter', () => {
    render(<ApplicantTerminal />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Jane Doe' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/CALLSIGN/)).toBeInTheDocument();
  });

  it('shows error for empty required fields', () => {
    render(<ApplicantTerminal />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/is required/)).toBeInTheDocument();
  });

  it('allows skipping optional fields', () => {
    render(<ApplicantTerminal />);
    const input = screen.getByRole('textbox');

    // Step 1: name (required)
    fireEvent.change(input, { target: { value: 'Jane' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Step 2: callsign (optional — skip)
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should advance to step 3
    expect(screen.getByText(/SECURE_CONTACT/)).toBeInTheDocument();
  });
});
