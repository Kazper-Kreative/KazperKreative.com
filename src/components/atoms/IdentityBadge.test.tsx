import { render, screen } from '@testing-library/react';
import IdentityBadge from './IdentityBadge';
import { useUserRole } from '@/hooks/useUserRole';

// Mock useUserRole
jest.mock('@/hooks/useUserRole', () => ({
  useUserRole: jest.fn(),
}));

describe('IdentityBadge', () => {
  it('renders the role and ID correctly', () => {
    (useUserRole as any).mockReturnValue({
      role: 'CLIENT',
      identityId: 'CLIENT_123',
      getThemeColor: () => '#10b981',
    });

    render(<IdentityBadge />);
    const roleBadges = screen.getAllByText(/CLIENT/i);
    expect(roleBadges.length).toBeGreaterThan(0);
    expect(screen.getByText(/CLIENT_123/i)).toBeInTheDocument();
  });
});
