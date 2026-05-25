import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommsTerminal from './CommsTerminal';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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

describe('CommsTerminal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Element.prototype.scrollTo = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });
  });

  it('renders the channel header with job title', () => {
    render(<CommsTerminal jobId="job-1" jobTitle="Build MVP" currentUserEmail="me@test.com" />);
    expect(screen.getByText('Build MVP')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows empty channel message when no messages', async () => {
    render(<CommsTerminal jobId="job-1" jobTitle="Build MVP" currentUserEmail="me@test.com" />);
    await waitFor(() => {
      expect(screen.getByText(/No messages yet/)).toBeInTheDocument();
    });
  });

  it('renders message input', () => {
    render(<CommsTerminal jobId="job-1" jobTitle="Build MVP" currentUserEmail="me@test.com" />);
    expect(screen.getByLabelText('Message input')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  it('sends a message on Enter key', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }) // send
      .mockResolvedValueOnce({ ok: true, json: async () => [{ _id: 'm1', sender: 'me@test.com', content: 'Hello', timestamp: new Date().toISOString() }] }); // refetch

    render(<CommsTerminal jobId="job-1" jobTitle="Build MVP" currentUserEmail="me@test.com" />);

    const input = screen.getByLabelText('Message input');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/messages', expect.objectContaining({ method: 'POST' }));
    });
  });
});
