import { render, screen, act } from '@testing-library/react';
import GhostScan from './GhostScan';

// Mock useUISound
jest.mock('@/hooks/useUISound', () => ({
  useUISound: () => ({
    playSound: jest.fn(),
    playClick: jest.fn(),
    playSuccess: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ ip: '127.0.0.1' }),
  })
) as jest.Mock;

describe('GhostScan', () => {
  it('renders the scanning overlay', async () => {
    await act(async () => {
      render(<GhostScan onComplete={() => {}} />);
    });
    expect(screen.getByText(/AUDITING CONNECTION IDENTITY/i)).toBeInTheDocument();
  });
});
