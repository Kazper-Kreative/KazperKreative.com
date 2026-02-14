# Specification: Dynamic Agent Roster

## Goal
Implement a visually stunning, dynamic gallery to showcase the agency's specialized engineering talent. The roster should fetch data from Sanity.io and provide an immersive interface for potential clients and investors to explore individual agent expertise.

## Requirements

### 1. Data Integration (Sanity.io)
- Define and integrate with the `agent` schema in Sanity.
- Fetch agent data (name, role, bio, picture, professional links) dynamically on the `/agents` page.
- Implement robust error handling and loading states for data fetching.

### 2. High-Fidelity UI/UX
- **Grid Layout:** A responsive, high-contrast grid using the agency's "Technical Noir" aesthetic.
- **Agent Cards:** Immersive card components with:
    - Hover effects (e.g., subtle glow, scale, or 3D tilt).
    - High-quality image rendering using `next/image`.
    - Clear typography using Geist Sans/Mono.
- **Filtering:** (Optional/Bonus) Ability to filter agents by specialty (e.g., AI/ML, WebGL, QA).

### 3. Professional Links
- Each agent card should link to their respective professional profiles (Upwork, Notion, or personal portfolios).
- Implement an "Apply to Join" CTA that directs potential talent to the acquisition portal.

### 4. Performance & Accessibility
- Ensure the gallery is lightweight and performant even with high-resolution agent photos.
- Adhere to WCAG AA contrast standards.
- Respect `prefers-reduced-motion` for all roster animations.
