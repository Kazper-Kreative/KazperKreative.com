import { getUserRole } from './auth';

describe('Auth Utilities', () => {
  it('should return "GUEST" when no session is provided', async () => {
    const role = await getUserRole(null);
    expect(role).toBe('GUEST');
  });

  it('should return the correct role from the session', async () => {
    const mockSession = {
      user: {
        role: 'AGENT',
      },
    };
    const role = await getUserRole(mockSession as any);
    expect(role).toBe('AGENT');
  });
});
