# Specification: Gamification & Engagement Layer

## Core Vision: "Roblox meets AAA"
We aim to blend the accessible, rewarding loops of platforms like Roblox (clear progression, instant feedback, collectability) with the high-fidelity, polished aesthetic of AAA game UI (smooth animations, immersive sound design, premium materials).

## 1. Engagement Mechanics

### 1.1 Experience Points (XP)
- **Passive Gain:** Users earn XP slowly over time while active on the site (e.g., +10 XP every 30s).
- **Active Gain:**
    - **Page Visit:** +50 XP (First time only per session/day).
    - **Interaction:** +20 XP (Expanding a case study, clicking a specialized button).
    - **Discovery:** +100 XP (Finding hidden elements or reaching the bottom of a long page).
- **Leveling:** Simple level curve (Level 1 -> 1000 XP). Visual feedback on level up.

### 1.2 Badges & Achievements
- **System:** A collection of unlockable badges displayed in the User Profile (Command Center).
- **Types:**
    - **"Intel Gatherer":** Read 3 full case studies.
    - **"Recruit":** Clicked the "Apply" or "Join" button.
    - **"Deep Dive":** Scrolled to the bottom of the homepage.
    - **"Networker":** Clicked a social link.

### 1.3 Sound Effects (SFX)
- **UI Feedback:**
    - **Hover:** Subtle, high-tech chirp/blip.
    - **Click:** Satisfying, mechanical switch or digital confirmation sound.
    - **Success/Unlock:** A more prominent, rewarding sound for badges/level ups.
- **Controls:** Global mute toggle in the Command Center/Navbar.

## 2. Technical Architecture

### 2.1 State Management
- **Library:** `zustand` (Lightweight, efficient, persists to localStorage).
- **Persistence:** `persist` middleware to save XP/Badges across sessions.

### 2.2 Audio Engine
- **Library:** `use-sound` or distinct `Audio` API hooks.
- **Assets:** Short, optimized `.mp3` or `.wav` files.
- **Accessibility:** Respect `prefers-reduced-motion` (reduce visual flair) and provide a clear mute toggle.

### 2.3 UI Components
- **XP Bar:** Persistent, subtle progress bar (possibly integrated into HUD or Navbar).
- **Toast/Notification:** "Badge Unlocked: [Name]" popup (Top Center or Bottom Right).
- **Profile Card:** A modal or section in the Command Center showing Level, XP, and Badges.

## 3. Aesthetic Guidelines
- **Visuals:** Glassmorphism, neon accents (Purple/Cyan), bold typography (Chakra Petch/Orbitron style if available, or just bold Sans).
- **Motion:** Bouncy, elastic animations for badges (pop-in), smooth filling for bars.
