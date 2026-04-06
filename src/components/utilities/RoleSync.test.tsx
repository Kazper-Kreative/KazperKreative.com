import React from 'react';
import { render } from '@testing-library/react';
import RoleSync from './RoleSync';
import { useSession } from 'next-auth/react';
import { useUserRole } from '@/hooks/useUserRole';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

// Mock useUserRole
jest.mock('@/hooks/useUserRole', () => ({
  useUserRole: jest.fn()
}));

describe('RoleSync', () => {
  const setRoleMock = jest.fn();
  const setIdentityIdMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserRole as jest.Mock).mockReturnValue({
      setRole: setRoleMock,
      setIdentityId: setIdentityIdMock
    });
  });

  it('should set the role and identityId when a session is active', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          role: 'AGENT',
          sanityId: 'agent-123'
        }
      }
    });

    render(<RoleSync />);

    expect(setRoleMock).toHaveBeenCalledWith('AGENT');
    expect(setIdentityIdMock).toHaveBeenCalledWith('agent-123');
  });

  it('should revert to GUEST role when no session is active', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null
    });

    render(<RoleSync />);

    expect(setRoleMock).toHaveBeenCalledWith('GUEST');
    expect(setIdentityIdMock).not.toHaveBeenCalled();
  });

  it('should not update if session does not contain role/sanityId', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test'
        }
      }
    });

    render(<RoleSync />);

    // setRole and setIdentityId are only called if the respective fields exist
    expect(setRoleMock).not.toHaveBeenCalled();
    expect(setIdentityIdMock).not.toHaveBeenCalled();
  });
});
