# CLAUDE.md — project context for AI assistants

Read this before making changes. The README has the human-facing guide;
this file calls out conventions and gotchas Claude is likely to hit.

## What this site is

The Kazper Kreative marketing site. **Two halves under one roof:** a
creative **agency** (Unreal Engine, real-time 3D, brand, web) and
**Kazper's Echo**, the in-house **game studio**. The site is brand +
portfolio surfaces plus two lead capture paths (`/contact`, `/join`)
and a private submissions **inbox** (`/inbox`).

In mid-2026 the whole public site was **re-ported from a standalone
static HTML/CSS/JS site** (`brand.css` + `site.js`) into this Next.js
app, and the backend was **switched from Sanity/NextAuth/Resend to
Supabase**. The old cinematic `/experience`, the Sanity CRM, and the
`/start` funnel are **gone** — don't reintroduce them.

## Voice & brand

- Dual framing: **Kazper Kreative (agency) × Kazper's Echo (studio)**.
  Confident, "frontier"-flavoured premium-agency copy.
- Visual system is the **"Inferno" palette** (warm orange/magenta →
  violet → cyan gradient) defined in `globals.css` `:root`. It's the
  default and the canonical look.
- The brand mark is the iridescent **K** at `public/assets/k-mark.png`
  (favicon + nav + hero orb). NOTE: this is currently a placeholder
  copy of `logo.jpg` — drop the real iridescent PNG at that exact path
  to update everywhere at once.

## Stack

Next.js 16 App Router (Turbopack), React 19, Tailwind v4 (CSS-first —
`@import "tailwindcss"` lives at the top of `globals.css`; **there is
no `tailwind.config`**), **Supabase** (`@supabase/supabase-js`), Jest +
RTL for unit tests, Playwright for E2E. Fonts via `next/font/google`
(Space Grotesk display, Hanken Grotesk body, JetBrains Mono mono).

**Removed and not coming back:** Sanity, next-sanity, NextAuth, Resend,
Three.js / R3F / Drei, Framer Motion, Zustand, next-themes,
lucide-react. If you reach for one of these, you're probably solving
the wrong problem.

## The design system

`src/app/globals.css` **is** the design system — a hand-authored,
class-based system ported from the static site's `brand.css`, plus
page-specific sections (home, studio, work, join, contact, portfolio,
inbox) under clear comment headers. It is **not** utility-first; pages
compose semantic classes (`.btn`, `.card`, `.kicker`, `.cap`,
`.cta-band`, `.proj-card`, `.cs-hero`, …). Edit CSS here, not inline,
for anything reusable. Dark-only: `<html className="dark">` in
`src/app/layout.tsx` (no theme toggle).

## Routing & layout

- `src/app/(site)/` is a route group wrapped by `SiteLayout`
  (`SiteHeader` + `SiteFooter`): `/`, `/agency`, `/studio`, `/work`,
  `/work/[slug]` (case studies), `/join`, `/contact`, `/portfolio`
  (`noindex`).
- `src/app/inbox/` is **standalone** (no site chrome), `noindex`.
- `src/app/layout.tsx` (root) mounts `ProjectModalProvider` +
  `SiteInteractions` + Vercel `Analytics`, sets fonts and metadata.

## Interaction layer (`src/components/site/`)

The static site's `site.js` behaviours are ported to React:

- `SiteInteractions.tsx` — reveal-on-scroll (`[data-reveal]`/`.in` +
  the reveal-fallback safety net) and hover tilt (`[data-tilt]`). It's
  mounted once and **re-scans the DOM on every route change** via
  `usePathname()`, so new pages get wired up. Pages opt in by putting
  `data-reveal`/`data-delay`/`data-tilt` attributes directly in JSX —
  no wrapper component.
- `ProjectModal.tsx` — the shared project-detail modal. Any element
  with `className="js-proj" data-proj="<slug>"` opens it via a
  **delegated document click listener** (works for server-rendered and
  client grids alike). Project data lives in **`src/data/projects.ts`**
  (single source for grid + modal + case-study pages). `caseUrl`s are
  `/work/<slug>`.
- Forms (`ContactForm`, `ApplicationForm`, `NewsletterForm`) are client
  islands that call `src/lib/supabase/submissions.ts` and flip to a
  `.sent` state. `captureForm` keys fields by their `<label>` text.

## Supabase backend

- `src/lib/supabase/client.ts` — browser client. Reads
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, falling
  back to the project's known public values so it works out of the box.
  The anon key is **safe to expose** (RLS-gated).
- `src/lib/supabase/submissions.ts` — TS port of the old `inbox.js`
  (`inbox.save/fetchAll/setRead/remove/clear` + `signIn/signOut/
  hasSession`). Has a **localStorage fallback** when Supabase isn't
  configured.
- Table: `submissions(id, created_at, type, fields jsonb, read)` with
  RLS: anon can INSERT; authenticated (the owner) can read/update/
  delete. All public forms write here; `type` is `Contact` |
  `Application` | `Newsletter`.
- **`/inbox` is the CRM.** Sign in with the Supabase email/password to
  read submissions. (`INBOX_PIN` only applies in the localStorage
  fallback.)

## Conventions / gotchas

- **Plain `<img>` is intentional** — the design system relies on CSS
  `aspect-ratio`/`object-fit`. `@next/next/no-img-element` is disabled
  in `eslint.config.mjs`. Real art lives in `public/assets/`.
- **Internal navigation uses `<Link>`**; external/`mailto`/hash links
  stay `<a>`. (`no-html-link-for-pages` is enforced.)
- The static site's authoring tools — the **Tweaks panel** and the
  **`<image-slot>`** drag-drop web component — were intentionally
  **dropped**. Gallery placeholders use the `.slot-ph` class.
- Components that use hooks need `"use client"`. `SiteFooter` is a
  server component; its newsletter is the `NewsletterForm` client
  island.

## Old URLs

`next.config.ts` 301-redirects retired routes: `/start`,`/discovery`,
`/brief` → `/contact`; `/agents*` → `/join`; `/dashboard`,
`/workstation`,`/experience` → `/`; `/projects/:slug*` → `/work`.

## Tests before commit

```bash
npm run test          # Jest (jsdom)
npm run test:e2e      # Playwright (chromium installed once)
```

E2E covers homepage CTAs/nav, the work filter + project modal, a case
study page, contact submit (Supabase request is route-stubbed so no
real row is written), and the redirects. If you change a string a test
asserts on, update the test in the same commit.

## Windows + line endings

The repo is CRLF on disk. For bulk text edits across many files use
PowerShell with `[System.IO.File]::ReadAllText` /
`[System.IO.File]::WriteAllText` (byte-faithful). The Edit tool also
preserves CRLF.

## Known follow-ups

- Replace the placeholder `public/assets/k-mark.png` with the real
  iridescent K PNG.
- CSP is still `Content-Security-Policy-Report-Only` (now scoped to
  `*.supabase.co`). Watch DevTools, then flip to enforce.
- Confirm the Supabase `submissions` table + RLS policies are
  provisioned in the project (`lenbcecnvjaylhigtlfl`); the inbox
  silently falls back to localStorage if not.
