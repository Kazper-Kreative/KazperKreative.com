-- ===========================================================================
-- Lab accounts + per-game stats (chess first).
-- Run once in the Supabase SQL editor (project lenbcecnvjaylhigtlfl).
--
-- Model:
--   lab_profiles  — the top-level Lab account (one row per auth user).
--   game_stats    — per-game rating + W/L/D, keyed (user_id, game). Generic so
--                   every Lab game can hang stats off the same account.
--   chess_games   — chess-specific game archive (PGN-ish moves, result, accuracy).
--
-- Unlike lab_members (service-role writes only), these are written from the
-- client (no service-role key in the browser), so each user may read/write
-- ONLY their own rows. RLS enforces that.
-- ===========================================================================

-- ── top-level account ──────────────────────────────────────────────────────
create table if not exists public.lab_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  handle     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.lab_profiles enable row level security;
drop policy if exists "profiles: read own"   on public.lab_profiles;
drop policy if exists "profiles: write own"  on public.lab_profiles;
create policy "profiles: read own"  on public.lab_profiles for select using (auth.uid() = user_id);
create policy "profiles: write own" on public.lab_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── per-game stats (chess, then checkers, …) ───────────────────────────────
create table if not exists public.game_stats (
  user_id       uuid not null references auth.users(id) on delete cascade,
  game          text not null,                 -- 'chess', 'checkers', …
  rating        integer not null default 1200,
  played        integer not null default 0,
  wins          integer not null default 0,
  losses        integer not null default 0,
  draws         integer not null default 0,
  best_accuracy real,
  updated_at    timestamptz not null default now(),
  primary key (user_id, game)
);
alter table public.game_stats enable row level security;
drop policy if exists "stats: read own"  on public.game_stats;
drop policy if exists "stats: write own" on public.game_stats;
create policy "stats: read own"  on public.game_stats for select using (auth.uid() = user_id);
create policy "stats: write own" on public.game_stats for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── chess game archive ─────────────────────────────────────────────────────
create table if not exists public.chess_games (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  color        text,                            -- 'w' | 'b'
  opponent     text,                            -- 'bot' | 'human'
  level        text,                            -- difficulty tier / opponent label
  result       text,                            -- 'win' | 'loss' | 'draw'
  accuracy     real,
  rating_after integer,
  moves        text                             -- space-separated SAN (or PGN)
);
alter table public.chess_games enable row level security;
create index if not exists chess_games_user_created_idx
  on public.chess_games (user_id, created_at desc);
drop policy if exists "games: read own"   on public.chess_games;
drop policy if exists "games: insert own" on public.chess_games;
drop policy if exists "games: delete own" on public.chess_games;
create policy "games: read own"   on public.chess_games for select using (auth.uid() = user_id);
create policy "games: insert own" on public.chess_games for insert with check (auth.uid() = user_id);
create policy "games: delete own" on public.chess_games for delete using (auth.uid() = user_id);
