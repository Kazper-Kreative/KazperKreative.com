import { render, screen, fireEvent, act } from '@testing-library/react';
import CommandPalette from './CommandPalette';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/hooks/useUISound', () => ({
  useUISound: () => ({ playSound: jest.fn() }),
}));

jest.mock('@/store/useGamificationStore', () => ({
  useGamificationStore: () => ({
    xp: 100,
    level: 3,
    badges: [
      { id: 'explorer', name: 'Explorer', description: 'Explore the site', icon: 'Compass' },
    ],
    unlockedBadges: ['explorer'],
  }),
}));

jest.mock('@/components/atoms/ClientSafeIcon', () => {
  return function MockIcon({ name }: { name: string }) {
    return <span data-testid={`icon-${name}`}>{name}</span>;
  };
});

// Mock fetch for location API
global.fetch = jest.fn().mockResolvedValue({
  json: async () => ({ city: 'Toronto', region_code: 'ON' }),
});

describe('CommandPalette', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is hidden by default', () => {
    render(<CommandPalette />);
    expect(screen.queryByText('SYSTEM-V INTERFACE')).not.toBeInTheDocument();
  });

  it('opens on Ctrl+K', () => {
    render(<CommandPalette />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });
    expect(screen.getByText('SYSTEM-V INTERFACE')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<CommandPalette />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });
    expect(screen.getByText('SYSTEM-V INTERFACE')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.queryByText('SYSTEM-V INTERFACE')).not.toBeInTheDocument();
  });

  it('filters actions by search query', () => {
    render(<CommandPalette />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'agents' } });

    expect(screen.getByText(/Meet Our Engineers/i)).toBeInTheDocument();
    expect(screen.queryByText(/Our Expertise/i)).not.toBeInTheDocument();
  });

  it('shows no results message when query matches nothing', () => {
    render(<CommandPalette />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'xyznonexistent' } });

    expect(screen.getByText(/NO_RESULTS_FOUND/)).toBeInTheDocument();
  });

  it('displays diagnostics tab', () => {
    render(<CommandPalette />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });

    fireEvent.click(screen.getByText('diagnostics'));
    expect(screen.getByText(/SYSTEM_METRICS/)).toBeInTheDocument();
  });
});
