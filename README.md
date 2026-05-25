# Kazper Kreative LLC — Website

The marketing site for Kazper Kreative, an Ontario-based agency for game
development, QA engineering, and immersive UI. Built on Next.js 16
(App Router) with content authored in Sanity.

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in the Sanity + auth secrets
npm run dev                     # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server with hot reload |
| `npm run build` | Production build via Turbopack |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint with `eslint-config-next` |
| `npm run test` | Jest unit + integration tests (`*.test.ts(x)`) |
| `npm run test:e2e` | Playwright end-to-end tests (`e2e/*.spec.ts`) |

The dev server reads `.env.local`. Production env vars come from your
hosting provider (Vercel).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind v4 (CSS-first via `@theme`) |
| Animation | Framer Motion |
| 3D | Three.js + React Three Fiber + Drei (scoped to `/experience`) |
| State | Zustand (with `persist` middleware) |
| Forms / fetch | Native React + fetch |
| CMS | Sanity v4 (Studio embedded at `/studio`) |
| Auth | NextAuth v5 (beta) — Google + GitHub OAuth |
| Email | Resend |
| Unit tests | Jest + React Testing Library + jest-environment-jsdom |
| E2E tests | Playwright (Chromium) |

## Routing

| Route | Purpose |
|---|---|
| `/` | Homepage: hero, services, work, pricing, contact |
| `/agents` | The team (Mason currently; Hunter and Levi archived in Sanity) |
| `/agents/join` | Contractor application terminal |
| `/start` | Single lead-capture funnel (3 steps → Sanity `lead` + Resend email) |
| `/experience` | Cinematic intro: scroll-driven 3D, HUD, ambient audio. Reduced-motion users get a static fallback. |
| `/projects/[slug]` | Case studies (ISR, revalidate every hour) |
| `/dashboard` | Client view of their jobs (auth-gated) |
| `/workstation` | Agent kanban for assigned jobs (auth-gated) |
| `/studio` | Embedded Sanity Studio |
| `/unauthorized` | Sign-in page with Google + GitHub buttons |
| `/api/start` | Lead-form submission handler |
| `/api/contact` | Contact-form submission handler |
| `/api/applicants` | Contractor application handler |
| `/api/messages` | In-job chat (CommsTerminal) |

`/discovery` and `/brief` 301-redirect to `/start`.

## Architecture notes

- **Atomic Design** under `src/components/`: `atoms/`, `molecules/`,
  `organisms/`, `templates/`, `layouts/`. Most pages render an
  organism through a template.
- **Server vs client components**: pages and templates are RSC where
  possible. Components that need `useState` / `useEffect` /
  `useRouter` have `"use client"` at the top.
- **Cinematic chrome is scoped to `/experience`**: HUD, CommandPalette,
  IdentityBadge, ScanlineOverlay, GlitchTransition, GhostScan, and the
  AudioProvider all live behind that route's layout. The rest of the
  site is plain.
- **Sanity data fetching** happens server-side in pages or route
  handlers. Client components receive data as props.
- **Auth flow**: NextAuth's `jwt` callback looks up the email in
  Sanity (`agent` or `client` doc) and stashes `role` + `sanityId` on
  the token. Session callback exposes them to client components. The
  type augmentation lives in `src/types/next-auth.d.ts`.

## Where to make changes

| To... | Edit... |
|---|---|
| Add or update content (services, projects, agents, leads) | Sanity Studio at `/studio` |
| Change site copy | The relevant component in `src/components/` |
| Add a new route | `src/app/<route>/page.tsx` |
| Change global styles or fonts | `src/app/globals.css` + `src/app/layout.tsx` |
| Add SEO / JSON-LD | `src/app/layout.tsx` (org + service graph) or per-page metadata |
| Tighten the CSP | `next.config.ts` — currently `Content-Security-Policy-Report-Only`; flip the key to `Content-Security-Policy` to enforce |
| Adjust auth providers / Sanity lookup | `src/auth.ts` |
| Update the lead-capture funnel | `src/app/start/page.tsx` + `src/app/api/start/route.ts` |

## Testing

```bash
npm run test         # Jest (unit + integration). Fast, no browser.
npm run test:e2e     # Playwright. Requires production build; auto-starts server.
```

Before the first `npm run test:e2e`:

```bash
npx playwright install chromium
```

CI runs both on every push to `master` (see `.github/workflows/ci.yml`).
Playwright reports upload as an artifact on failure.

## Performance audit (manual)

Bundle weight and Core Web Vitals aren't measured in CI yet. To audit:

```bash
# Local Lighthouse against a production build
npm run build && npm run start &
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse.html
```

Targets: LCP < 2.5s, CLS < 0.1, INP < 200ms on a mid-tier mobile.

For bundle inspection, install `@next/bundle-analyzer` and wire it into
`next.config.ts`.

## Deployment

The site deploys via the connected hosting platform on push to `master`.
Required env vars in production:

- `NEXT_PUBLIC_SITE_URL` — canonical URL for sitemap, JSON-LD, OG tags
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_WRITE_TOKEN` — for `/api/*` writes
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXTAUTH_URL`
- `RESEND_API_KEY`, optional `EMAIL_FROM` and `EMAIL_TO`

## License

Proprietary — © Kazper Kreative LLC.
