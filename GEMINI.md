# Agency Brain - Kazper Kreative LLC

## 1. Identity
We are a premium agency expanding into the Ontario market. Our aesthetic is "Dark Mode," "High-Fidelity," and "Technical," drawing inspiration from The Batman/Horror genres.

## 2. Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Content Management:** Sanity.io

## 3. Coding Standards
- **TypeScript:** Strict usage for robust and maintainable code.
- **Component Modularity:** Adherence to Atomic Design principles for scalable and reusable components.
- **Performance:** Performance-first approach, especially for 3D integrations.

## 4. Team Workflow
All code developed must be production-ready and designed for scalability, facilitating seamless collaboration among multiple contributors.

## 5. Session Summary (2026-02-11)
This session focused on significant enhancements and fixes for the Kazper Kreative LLC website:

*   **Initial Setup & Push:** Performed initial project health checks (npm install, lint, build, git status) and pushed initial commits.
*   **Mobile Optimization (Round 1):**
    *   Adjusted `HeroSection` for responsive font sizes, padding, and full-screen height.
    *   Made heading font sizes and margins responsive in `ServicesGrid` and `WorkGrid`.
    *   Adjusted padding in `ServiceCard` and `ProjectCard` for mobile.
*   **Text Overflow Fixes:**
    *   Added `break-words` and adjusted padding in `HeroSection` and `ContactCTA` to prevent text overflow on mobile.
    *   Made `HomeTemplate` section paddings responsive.
*   **File Organization & Logo Integration:**
    *   Moved `PageWrapper.tsx` to `src/components/layouts`.
    *   Removed unused SVG files from `public/`.
    *   Integrated `Logo.jpeg` as the website favicon.
*   **Animated Contact Form Overlay:**
    *   Created `ContactForm.tsx` with form fields, close button, and `framer-motion` animations.
    *   Implemented state management in `ContactCTA.tsx` to toggle the contact form overlay.
    *   Modified `Button.tsx` to add `whileHover` and `whileTap` animations to all buttons.
    *   Fixed build errors by adding `"use client"` directives to `ContactCTA.tsx` and `Button.tsx`.
*   **Agents Page Implementation:**
    *   Created `/agents` page with `AgentCard` (molecule) and `AgentsGrid` (organism) components.
    *   Populated agent data for Levi, Mason, and Hunter Wilkinson.
    *   Added a link to the agents page on the homepage (`HomeTemplate.tsx`).
    *   Updated agent names, roles, bios, and profile pictures (moving images to `public/images/agents`).
    *   Summarized agent bios and made entire `AgentCard`s clickable links to Upwork.
*   **Homepage UX Improvements:**
    *   Added an animated scroll-down indicator to `HeroSection`.
    *   Implemented a sticky, responsive navigation bar (`Navbar.tsx`).
    *   Implemented a "Back to Top" button.
    *   Ensured smooth scrolling for internal links (`globals.css`).
    *   Added IDs to relevant sections in `HomeTemplate.tsx` for navigation.
    *   Improved mobile responsiveness of the Navbar with a hamburger menu.