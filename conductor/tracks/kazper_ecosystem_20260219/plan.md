# Implementation Plan: The Kazper Ecosystem (Simulated Reality)

## Phase 1: Infrastructure & Authentication
- [x] **Task: Identity Architecture**
    - [x] Choose and initialize Auth provider (NextAuth or Clerk).
    - [x] Define User Schema in Sanity (or external DB) for Roles: `CLIENT`, `AGENT`, `ADMIN`.
    - [x] Create basic middleware for role-based route protection.
- [x] **Task: Data Layer - Jobs & Profiles**
    - [x] Design Schema for `Job` (Brief, Status, Assigned Agent, Milestones).
    - [x] Design Schema for `AgentProfile` (XP, Projects, Rank, Bio).
    - [x] Design Schema for `Message` (Encrypted/Private channel logic).
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Authentication' (Protocol in workflow.md)**

## Phase 2: The Command Center (Client Interface)
- [x] **Task: Job Submission Terminal**
    - [x] Create `BriefTerminal` component (Stylized command-line input).
    - [x] Implement multi-step brief submission logic.
    - [x] Add success/failure feedback loops with "System Sounds."
- [x] **Task: Client HUD Dashboard**
    - [x] Create `ClientDashboard` organism.
    - [x] Implement "My Projects" view with real-time status updates.
    - [x] Replace "Discovery Call" links with "Initialize Project" flow.
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: The Command Center' (Protocol in workflow.md)**

## Phase 3: The Workstation (Agent Interface)
- [ ] **Task: Gamified Agent Leaderboard**
    - [ ] Refactor `AgentsGrid` into a `SquadRoster` with ranks/XP levels.
    - [ ] Implement dynamic sorting based on "Agency Impact" or "Active Jobs."
    - [ ] Add interactive "Dossier" view for each Agent.
- [ ] **Task: Agent Task Board**
    - [ ] Create `AgentWorkspace` to view assigned briefs.
    - [ ] Implement "Accept/Decline" logic for incoming briefs.
    - [ ] Build status management (In Progress, Review, Completed).
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
