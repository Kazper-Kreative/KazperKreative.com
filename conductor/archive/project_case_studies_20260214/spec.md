# Specification: Interactive Project Case Studies

## Goal
Create a highly immersive and technically detailed template for project case studies. These pages should not just be static reviews but "deployed experiences" themselves, showcasing the agency's ability to blend deep technical execution with cinematic presentation.

## Requirements

### 1. Enhanced Data Integration (Sanity.io)
- Audit and expand the `project` schema in Sanity.
- Support rich content fields:
    - Technical challenge description.
    - Solution architecture.
    - Results/Impact metrics.
    - Gallery of high-fidelity media (images/videos).
    - Metadata for interactive 3D "Easter eggs" or scene overlays.

### 2. High-Fidelity UI/UX
- **Immersive Template:** A responsive layout following the "Technical Noir" aesthetic.
- **Dynamic Headers:** High-contrast project titles with kinetic entrance animations.
- **Rich Media Support:** Optimized image/video wrappers with hardware acceleration hints.
- **Geist Typography:** Use Geist Mono for technical snippets and Geist Sans for narrative prose.

### 3. Interactive 3D Elements (R3F)
- Integrate localized 3D components within the case study (e.g., interactive technical diagrams, floating project assets).
- Ensure these elements react to scroll and user hover, consistent with the `CinematicLanding` pattern.

### 4. Navigation & Performance
- Smooth transitions between the portfolio grid and individual case studies.
- 60fps target for all transitions and interactive elements.
- Strict adherence to `usePerformanceConfig` for reduced motion and low-end hardware.
- SEO optimized with proper metadata and dynamic OG images.
