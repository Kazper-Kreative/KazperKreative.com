import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  unlockedAt?: string; // ISO Date
}

interface GamificationState {
  xp: number;
  level: number;
  badges: Badge[];
  unlockedBadges: string[]; // IDs only
  lastUnlockedBadgeId: string | null;
  isMuted: boolean;
  isAudioInitialized: boolean;
  visitedProjects: string[]; // Track unique project slugs
  
  // Actions
  addXP: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  trackProjectView: (slug: string) => void;
  clearLastUnlockedBadge: () => void;
  toggleSound: () => void;
  setAudioInitialized: (initialized: boolean) => void;
  resetProgress: () => void;
}

const LEVEL_THRESHOLD = 1000;

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      badges: [
        { id: 'recruit', name: 'Recruit', description: 'Joined the Agency network.', icon: 'UserPlus' },
        { id: 'intel_gatherer', name: 'Intel Gatherer', description: 'Read 3 full case studies.', icon: 'FileText' },
        { id: 'deep_dive', name: 'Deep Dive', description: 'Reached the bottom of the homepage.', icon: 'ArrowDown' },
        { id: 'networker', name: 'Networker', description: 'Clicked a social link.', icon: 'Globe' },
      ],
      unlockedBadges: [],
      lastUnlockedBadgeId: null,
      isMuted: false,
      isAudioInitialized: false,
      visitedProjects: [],

      addXP: (amount) => {
        const currentXP = get().xp;
        const newXP = currentXP + amount;
        const newLevel = Math.floor(newXP / LEVEL_THRESHOLD) + 1;
        
        set({ xp: newXP, level: newLevel });
      },

      unlockBadge: (badgeId) => {
        const { unlockedBadges, badges } = get();
        if (unlockedBadges.includes(badgeId)) return; // Already unlocked

        const badge = badges.find(b => b.id === badgeId);
        if (!badge) return;

        // Award XP only when first unlocking
        const xpReward = 50; 
        const currentXP = get().xp;
        const newXP = currentXP + xpReward;
        const newLevel = Math.floor(newXP / LEVEL_THRESHOLD) + 1;

        set({ 
          unlockedBadges: [...unlockedBadges, badgeId],
          lastUnlockedBadgeId: badgeId,
          xp: newXP,
          level: newLevel
        });
      },

      trackProjectView: (slug) => {
        const { visitedProjects, unlockedBadges } = get();
        if (visitedProjects.includes(slug)) return;

        const newVisited = [...visitedProjects, slug];
        set({ visitedProjects: newVisited });

        // If viewed 3 unique projects, unlock badge
        if (newVisited.length >= 3 && !unlockedBadges.includes('intel_gatherer')) {
          get().unlockBadge('intel_gatherer');
        }
      },

      clearLastUnlockedBadge: () => set({ lastUnlockedBadgeId: null }),

      toggleSound: () => set({ isMuted: !get().isMuted }),

      setAudioInitialized: (initialized) => set({ isAudioInitialized: initialized }),

      resetProgress: () => set({ xp: 0, level: 1, unlockedBadges: [], lastUnlockedBadgeId: null, isMuted: false, isAudioInitialized: false, visitedProjects: [] }),
    }),
    {
      name: 'kazper-gamification-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
