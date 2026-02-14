# Specification: Cinematic Landing Experience

## Goal
Transform the static landing page into a mind-blowing, cinematic experience using scroll-triggered 3D storytelling. The UX must feel weighted, technical, and high-contrast, setting a new standard for the agency's portfolio.

## Requirements

### 1. Scroll-Driven Navigation
- Implementation of a smooth scroll container that maps scroll progress (0 to 1) to the 3D scene timeline.
- The user should not feel they are just "scrolling past" content, but driving a narrative.

### 2. 3D Scene (R3F)
- **Environment:** High-contrast tech-noir environment. Minimalist but impactful.
- **Camera Path:** A scripted camera move that travels through different "stages" of the 3D environment as the user scrolls.
- **Lighting:** Dynamic light/shadow play. Use of spotlights and volumetric effects to highlight core value propositions.
- **Particles/VFX:** Technical particles or "data streams" that react to scroll speed and camera position.

### 3. Content Integration
- **Overlay System:** 2D text elements (using Framer Motion) that fade in/out or slide into view based on the camera's position in the 3D scene.
- **Value Propositions:**
    - Act 1: Technical Mastery (The Moat)
    - Act 2: Cinematic Immersion (The Experience)
    - Act 3: Precision Engineering (The Result)

### 4. Performance & Fallbacks
- **Optimization:** Aggressive asset compression and lazy-loading of 3D assets.
- **Fallback:** High-fidelity static background or simpler 2D animation for mobile/low-end devices or users with `prefers-reduced-motion`.

### 5. Interaction
- Interactive 3D elements that react to mouse hover (subtle distortion, light following) even while scroll-locked to the camera path.
