# Implementation Plan: The Kazper Ecosystem (Simulated Reality)

## Phase 1: Infrastructure & Authentication
- [x] **Task: Identity Architecture**
- [x] **Task: Data Layer - Jobs & Profiles**
- [x] **Task: Dynamic Role Hook**
- [x] **Task: Identity Mapping (Account-to-Profile Link)**
    - [x] Update NextAuth session to include Sanity `_id` and `role`.
    - [x] Create `getProfileByEmail` utility for role resolution.
    - [x] Implement auto-initialization for new Client profiles.
- [x] **Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Authentication' (Protocol in workflow.md)**

## Phase 2: The Command Center (Client Interface) [checkpoint: da44656]
- [x] **Task: Job Submission Terminal**
    - [x] Create `BriefTerminal` component (Stylized command-line input).
    - [x] Implement multi-step brief submission logic.
    - [x] Add success/failure feedback loops with "System Sounds."
- [x] **Task: Client HUD Dashboard**
    - [x] Create `ClientDashboard` organism.
    - [x] Implement "My Projects" view with real-time status updates.
    - [x] Replace "Discovery Call" links with "Initialize Project" flow.
- [x] **Task: Conductor - User Manual Verification 'Phase 2: The Command Center' (Protocol in workflow.md)**

## Phase 3: The Workstation (Agent Interface)
- [x] **Task: Tactical Scan Onboarding**
    - [x] Build a "Ghost Scan" animation for Newcomers on first load.
    - [x] Automatically assign "GUEST_XXXX" ID and emerald HUD colors.
- [x] **Task: Role-Based HUD Adaptations**
    - [x] Integrate color-coded themes (Emerald=Client, Purple=Agent, Zinc=Guest).
    - [x] Update `TechnicalBackground` to react to the current role's theme.
- [x] **Task: Gamified Agent Leaderboard**
    - [x] Refactor `AgentsGrid` into a `SquadRoster` with ranks/XP levels.
    - [x] Implement dynamic sorting based on "Agency Impact" or "Active Jobs."
    - [x] Add interactive "Dossier" view for each Agent.
- [x] **Task: Agent Task Board**
    - [x] Create `AgentWorkspace` to view assigned briefs.
    - [x] Implement "Accept/Decline" logic for incoming briefs.
    - [x] Build status management (In Progress, Review, Completed).
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: The Workstation' (Protocol in workflow.md)**

## Phase 4: Communication & Recruitment
- [ ] **Task: Encrypted Comms Terminal**
    - [ ] Build a private messaging UI (Text-only, tactical feel).
    - [ ] Integrate real-time subscription for instant message updates.
- [ ] **Task: Applicant Terminal**
    - [ ] Create `/join` route with a stylized recruitment terminal.
    - [ ] Implement dossier submission flow for new applicants.
- [ ] **Task: Conductor - User Manual Verification 'Phase 4: Communication & Recruitment' (Protocol in workflow.md)**

## Phase 5: Simulated Reality Refinement
- [ ] **Task: UI/UX Ecosystem Polish**
    - [ ] Integrate global "Simulated Reality" overlays (Scanlines, Glitch effects on transition).
    - [ ] Optimize 3D backgrounds for persistent state across dashboard views.
    - [ ] Audit performance to ensure <100ms interaction latency on mobile.
- [ ] **Task: Conductor - User Manual Verification 'Phase 5: Simulated Reality Refinement' (Protocol in workflow.md)**
