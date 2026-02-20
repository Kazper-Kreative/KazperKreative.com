export type UserRole = 'ADMIN' | 'AGENT' | 'CLIENT' | 'GUEST';

interface Session {
  user?: {
    role?: UserRole;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

/**
 * Returns the role of the user from the session.
 * Defaults to 'GUEST' if no session or role is found.
 */
export async function getUserRole(session: Session | null): Promise<UserRole> {
  if (!session?.user?.role) {
    return 'GUEST';
  }
  return session.user.role;
}
