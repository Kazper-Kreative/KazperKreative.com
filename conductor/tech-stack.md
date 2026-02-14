# Tech Stack: Kazper Kreative LLC

## Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **3D Graphics:** Three.js (@react-three/fiber, @react-three/drei)

## Backend & Services
- **Content Management:** Sanity.io
- **Email Service:** Resend

## Testing & Quality
- **Testing Framework:** Jest
- **Testing Library:** React Testing Library
- **Linting:** ESLint

## Performance & Accessibility
- **Detection:** `usePerformanceConfig` hook for `prefers-reduced-motion` and device capability.
- **Strategy:** Graceful degradation of 3D effects and simplified animation timelines.
