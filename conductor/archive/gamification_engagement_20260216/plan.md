# Implementation Plan: Gamification & Engagement Layer

## Phase 1: Foundation (State & Assets)
- [x] **Task: Setup Global Store (Zustand)**
    - [x] Install `zustand`.
    - [x] Create `useGamificationStore` with XP, Level, and Badge state.
    - [x] Implement `persist` middleware for local storage.
- [x] **Task: Audio Engine Hook**
    - [x] Install `use-sound` (Replaced with procedural Web Audio API for performance).
    - [x] Create `useUISound` hook (playHover, playClick, playSuccess).
    - [x] Add global mute toggle to store.
- [x] **Task: Asset Acquisition**
    - [x] Source or generate placeholder SFX (Procedurally generated sine/triangle waves).
    - [x] Add to `public/audio/` (Not needed due to procedural gen).

## Phase 2: UI Components (The "Roblox-AAA" Look)
- [x] **Task: XP Progress Bar**
    - [x] Create `XPBar` component (Integrated into HUD).
    - [x] Integrate into `HUD` or `Navbar` (Bottom Right).
- [x] **Task: Badge Notification (Toast)**
    - [x] Create `BadgeToast` component (AnimatePresence pop-up).
    - [x] Trigger on `unlockBadge` action.
- [x] **Task: Command Center Profile**
    - [x] Update `CommandPalette` to show current Level/XP.
    - [x] Add a "Badges" tab/section to `CommandPalette`.

## Phase 3: Integration & Logic
- [x] **Task: Page Tracking**
    - [x] Create a `ProjectTracker` component (client-side) to award XP on route change.
- [x] **Task: Interaction Hooks**
    - [x] Wrap key buttons (Contact, Apply, Case Study) with tracking logic.
    - [x] Add `onClick` handlers to trigger SFX and XP gain.
- [x] **Task: Scroll Depth Achievement**
    - [x] Integrate with `HUD` scroll tracking to award "Deep Dive" badge at 95% scroll.

## Phase 4: Polish & Tuning
- [x] **Task: Visual Polish**
    - [x] Add particle effects (Used Framer Motion spring/scale for badge pops).
    - [x] Ensure mobile responsiveness for new UI elements.
- [x] **Task: Sound Balancing**
    - [x] Normalize audio levels (Metallic & Airy profile implemented).
    - [x] Verify mute functionality works globally.
