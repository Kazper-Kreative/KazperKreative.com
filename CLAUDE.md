# CLAUDE.md — project context for AI assistants

Read this before making changes. The README has the human-facing guide;
this file calls out conventions and gotchas Claude is likely to hit.

## What this site is

The Kazper Kreative LLC marketing site. Premium agency: game dev, QA
engineering, immersive UI, based in Ontario. The site itself is a
lead-capture funnel (`/start`) plus brand/case-study surfaces. There's
also a small Sanity-backed CRM (clients, jobs, applicants, messages)
behind auth.

## Voice

The brand voice was rebooted in 2026 as part of a Tier 3 refactor. The
old GEMINI.md described a "Dark Mode / Batman / mil-tech" aesthetic —
that brief is **retired** on public surfaces.

- Public copy: plain premium-agency voice. Headlines describe what we
  do (game development, QA, immersive UI). CTAs say what they do
  ("Start a project", "View our work").
- The only place the mil-tech / cinematic mood survives is
  `/experience` — a skippable scroll-driven 3D intro with HUD,
  scanline overlay, ambient audio drone, and `GhostScan` onboarding.
- Internal Sanity enum values (`rank: STRIKE_READY`, `status: PENDING`)
  can keep their old names; just don't render those raw labels in
  public-facing UI.

## Stack

Next.js 16 App Router (Turbopack), React 19, Tailwind v4 (CSS-first
via `@theme inline` in `globals.css` — **there is no `tailwind.config.ts`**),
Sanity v4, NextAuth v5 (still beta, pinned to `5.0.0-beta.31`), Resend,
Three.js + R3F + Drei, Framer Motion, Zustand (with `persist`
middleware), Jest + RTL for unit tests, Playwright for E2E.

## Where the cinematic UI lives

Mounted **only on `/experience`** via `src/app/experience/layout.tsx`:

- `AudioProvider` (audio context + drone)
- `ScanlineOverlay`, `GlitchTransition`, CRT vignette
  (`.cinematic-vignette` class)
- `CinematicChrome` (bundles HUD, CommandPalette, QuickActions,
  IdentityBadge, GhostScan onboarding)
- `CinematicLanding` (scroll-driven 3D)

`Navbar.tsx` is plain everywhere — just logo + 4 links + mobile menu.
Do **not** put HUD/CommandPalette/IdentityBadge back into Navbar.

## Atomic design boundaries

`atoms/` should be small, presentational, hookless-ish.
`organisms/` is where complex stateful components live. If you write
something with a `<Canvas>`, a Zustand store call, or a non-trivial
effect graph, it's an organism, not an atom. `TechnicalBackground`
used to be in `atoms/`; it was moved to `organisms/` in Phase 5.

## Server vs client components

`HomeTemplate` and most page-level files are server components. Don't
add `"use client"` to them without a reason. Components that use
`useState`, `useEffect`, `useRouter`, etc., **must** start with
`"use client"` — if a hook-using component lacks the directive but
its parent has it, things work locally and silently break the moment
an RSC tree above it goes "use client"-free (Phase 4 caught two of
those: `ServiceCard` and `ContactForm`).

## Hydration

The codebase used to have 181 `suppressHydrationWarning` attributes
papering over mismatches; they were nearly all cargo-cult. Only **two
legitimate cases remain**: `<html>` and `<body>` in
`src/app/layout.tsx` (the canonical `next-themes` pattern).

Before adding a new `suppressHydrationWarning`: find the actual
mismatch source. The most common culprits in this codebase are
Zustand-`persist` reads (use a `mounted` gate) and components that
generate random IDs at module-init time (the old
`useUserRole.identityId` did `Math.random()` — fixed in Phase 1).

## Lead funnel

There is exactly one: `/start` → `/api/start` → Sanity `lead` doc +
Resend email. `/discovery` and `/brief` 301-redirect to `/start`. Don't
build a third funnel. CTAs across the site all point to `/start`.

## Auth

NextAuth v5 jwt-strategy. The `jwt` callback looks up the user's
email in Sanity (`agent` or `client` doc) and stashes `role` +
`sanityId` on the token. The session callback exposes them via
`session.user.role` and `session.user.sanityId`. Module augmentation
in `src/types/next-auth.d.ts` targets `@auth/core/jwt` (NOT
`next-auth/jwt` — that's just a re-export and augmentation won't merge
there).

**Auth-gated pages** (`/dashboard`, `/workstation`) check `session`
explicitly inside the page and `redirect('/unauthorized')` if missing.
The middleware also runs but has matcher subtleties — defense in depth
is correct here. Don't rip out the in-page check.

## Tests before commit

Run both before pushing:

```bash
npm run test          # Jest
npm run test:e2e      # Playwright (needs chromium installed once)
```

If you change a string that a test asserts on, update the test in the
same commit.

## Windows + line endings

The repo is CRLF on disk. `sed` on Git Bash flips files to LF and
explodes the diff. For bulk text edits across many files use
PowerShell with `[System.IO.File]::ReadAllText` /
`[System.IO.File]::WriteAllText` — those are byte-faithful. The Edit
tool also preserves CRLF in this repo.

## Known follow-ups

- Sentry + analytics deferred (Phase 6 decision). Bring them up when
  the user has the accounts ready.
- CSP is currently `Content-Security-Policy-Report-Only`. Watch
  DevTools for violations over a release or two, then flip to
  `Content-Security-Policy` to enforce.
- `next-auth` is still beta-only. Watch for a stable v5 release on
  npm dist-tags.
- 80 Dependabot vulnerabilities on master (38 high, 36 moderate, 6
  low) — mostly transitive from Sanity / Three.js. Triage as part of
  observability work.
