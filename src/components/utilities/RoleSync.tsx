"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserRole, Role } from '@/hooks/useUserRole';

export default function RoleSync() {
  const { data: session } = useSession();
  const { setRole, setIdentityId } = useUserRole();

  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role as Role;
      const sanityId = (session.user as any).sanityId as string;
      
      if (role) setRole(role);
      if (sanityId) setIdentityId(sanityId);
    } else {
      // Revert to guest if no session
      setRole('GUEST');
    }
  }, [session, setRole, setIdentityId]);

  return null; // This is a logic-only component
}
