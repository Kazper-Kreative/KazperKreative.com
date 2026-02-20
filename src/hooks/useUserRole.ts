import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'GUEST' | 'CLIENT' | 'AGENT' | 'ADMIN';

interface UserRoleState {
  role: Role;
  identityId: string;
  setRole: (role: Role) => void;
  setIdentityId: (id: string) => void;
  getThemeColor: () => string;
}

const THEME_COLORS: Record<Role, string> = {
  GUEST: '#71717a',  // Zinc
  CLIENT: '#10b981', // Emerald
  AGENT: '#a855f7',  // Purple
  ADMIN: '#f59e0b',  // Amber
};

export const useUserRole = create<UserRoleState>()(
  persist(
    (set, get) => ({
      role: 'GUEST',
      identityId: 'GUEST_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      setRole: (role) => set({ role }),
      setIdentityId: (identityId) => set({ identityId }),
      getThemeColor: () => THEME_COLORS[get().role],
    }),
    {
      name: 'kazper-identity-storage',
    }
  )
);
