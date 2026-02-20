# Specification: The Kazper Ecosystem (Simulated Reality)

## 1. Overview
Transform the Kazper Kreative agency website into a self-contained "Ecosystem" and "Simulated Reality." This platform will serve as a personal "Upwork-style" structure where Clients can submit briefs, Agents can manage project workflows, and Applicants can join the agency through a gamified recruitment terminal.

The aesthetic will push the "Technical/High-Fidelity" brand into a full HUD-driven experience while maintaining peak performance.

## 2. Functional Requirements

### 2.1 Identity & Access
- **Unified Auth:** Implementation of a secure login system (Standard Auth) for Clients and Agents.
- **Profile Roles:** Distinct interfaces for "Clients" (Project Owners) and "Agents" (Creators/Contributors).
- **Persistent State:** Profiles track XP, project history, and active status within the "Simulated Reality."

### 2.2 The "Command Center" (Client Side)
- **Brief Submission Terminal:** Replace the "Discovery Call" with a Command-line style or high-fidelity form for project briefing.
- **Unified HUD Dashboard:** Clients can view the status of their "Jobs," interact with their assigned Agents, and review deliverables.
- **Job Lifecycle:** Flow for posting jobs, receiving acceptance/decline notifications, and tracking milestone completion.

### 2.3 The "Workstation" (Agent Side)
- **Gamified Roster (Leaderboard):** The Agent list (Levi, Mason, Hunter) evolves into a "Leaderboard" or "Squad Roster" based on performance, XP, or project impact.
- **Encrypted Comms:** A secure, in-browser messaging system for direct Client-to-Agent communication.
- **Project Terminal:** A dashboard for agents to view open briefs, claim tasks, and update job statuses.

### 2.4 Recruitment Portal
- **Applicant Terminal:** A stylized, interactive terminal for new agency applicants to submit their dossiers.
- **Onboarding Flow:** Gamified steps for applicants to "prove their skills" before joining the roster.

## 3. Technical Requirements
- **Performance-First 3D:** Continued use of Three.js/R3F for HUD elements and background effects, ensuring high FPS on mobile/desktop.
- **Real-time Updates:** Use of Sanity.io or a real-time database layer (e.g., Supabase/Firebase) for job status and messaging.
- **Responsive HUD:** UI must feel like a "Tactical OS" regardless of screen size.

## 4. Acceptance Criteria
- [ ] Users can create accounts and be assigned "Client" or "Agent" roles.
- [ ] Clients can submit a project brief through the "Command Center."
- [ ] Agents can view a live, gamified leaderboard of the team.
- [ ] A functional messaging interface exists between Clients and Agents.
- [ ] The "Discovery Call" call-to-action is replaced by the "Enter Ecosystem" flow.

## 5. Out of Scope
- Integrated payment gateways (Phase 1 focus is on Briefing and Workflow).
- Live video/audio conferencing (Communication will be text-based/encrypted).
