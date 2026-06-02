# Kazper Kreative

The marketing site for **Kazper Kreative** — a creative agency and the
home of **Kazper's Echo**, an Unreal Engine game studio. Built with
Next.js 16, React 19, a hand-authored CSS design system, and Supabase
for form submissions and a private inbox.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build / preview:

```bash
npm run build
npm run start
```

## Environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SITE_URL=https://kazperkreative.com
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key — safe to expose; RLS-gated>
```

If these are unset the app falls back to the project's known public
Supabase values, and if Supabase is unreachable the inbox/forms fall
back to browser `localStorage` (demo mode).

## Routes

| Route | What it is |
|-------|-----------|
| `/` | Home — agency × studio overview |
| `/agency` | Agency capabilities, process, engagements |
| `/studio` | Kazper's Echo studio + in-the-works slate |
| `/work` | Portfolio grid (filterable) + project detail modal |
| `/work/[slug]` | Case studies (`mechaverse`, `vengeance`, `shadow`, `synx`) |
| `/join` | Recruitment + application form |
| `/contact` | Project inquiry form |
| `/portfolio` | Personal portfolio (`noindex`, unlinked) |
| `/inbox` | **Private** submissions inbox (Supabase auth) |

## How it's built

- **Design system:** `src/app/globals.css` — a class-based system
  (tokens, components, page sections). Dark-only; the default look is
  the "Inferno" palette. Fonts load via `next/font`.
- **Site chrome & interactions:** `src/components/site/` — header,
  footer, scroll-reveal + tilt (`SiteInteractions`), and the shared
  project modal (`ProjectModal`, driven by `src/data/projects.ts`).
- **Forms & inbox:** `src/lib/supabase/` — every form writes to a
  Supabase `submissions` table; `/inbox` reads them after you sign in
  with your Supabase account.

## Submissions inbox (Supabase)

Contact, application, and newsletter submissions land in a Supabase
`submissions` table. **Row Level Security** lets any visitor *insert*
but only an *authenticated* session (you) *read* them. View and manage
them at **`/inbox`** by signing in with your Supabase email/password.

```sql
create table submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text, fields jsonb, read boolean default false
);
alter table submissions enable row level security;
create policy "anyone can submit" on submissions for insert to anon          with check (true);
create policy "owner can read"     on submissions for select to authenticated using (true);
create policy "owner can update"   on submissions for update to authenticated using (true);
create policy "owner can delete"   on submissions for delete to authenticated using (true);
```

## Assets

Brand and project art live in `public/assets/`. The brand mark is
`k-mark.png` (favicon + nav + hero) — currently a placeholder; drop the
real iridescent K PNG at that path to update it everywhere.

## Tests

```bash
npm run test          # Jest unit tests
npm run test:e2e      # Playwright E2E (chromium installed once)
npm run lint          # ESLint
```

See `CLAUDE.md` for conventions and architecture notes.
