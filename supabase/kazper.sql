-- Kazper (the AI-me runtime in /kazper) — memory tables.
--
-- The runtime on Railway talks to these with the SERVICE-ROLE key, which
-- bypasses RLS. RLS is enabled with no policies, so anon/authenticated
-- clients (the public site) can read or write nothing. A future /kazper
-- dashboard will add owner-only policies here.
--
-- Run once in the Supabase SQL editor (project lenbcecnvjaylhigtlfl).

create table if not exists public.kazper_exchanges (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_text   text not null,
  reply_text  text not null,
  messages    jsonb not null default '[]'::jsonb  -- full prompt + tool calls: fine-tune material
);

-- Discord message ids of Kazper's replies -> the exchange they belong to
-- (so 👍/👎 reactions and !fix replies can find what they're rating).
-- Stored as text: Discord snowflakes exceed JS's safe integer range.
create table if not exists public.kazper_reply_messages (
  discord_message_id  text primary key,
  exchange_id         bigint not null references public.kazper_exchanges(id) on delete cascade
);

create table if not exists public.kazper_facts (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  text        text not null,
  source      text not null default 'owner' check (source in ('owner', 'kazper'))  -- who saved it
);
-- Added 2026-10-27 for Kazper's own notes; safe to re-run on an existing table.
alter table public.kazper_facts
  add column if not exists source text not null default 'owner' check (source in ('owner', 'kazper'));

create table if not exists public.kazper_feedback (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  exchange_id  bigint not null references public.kazper_exchanges(id) on delete cascade,
  kind         text not null check (kind in ('good', 'bad', 'correction')),
  correction   text
);

-- Things Kazper noticed (v1: Discord mentions/keywords in servers it's in).
create table if not exists public.kazper_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  source      text not null,
  summary     text not null,
  data        jsonb not null default '{}'::jsonb
);

create index if not exists kazper_events_created_at_idx on public.kazper_events (created_at desc);
create index if not exists kazper_feedback_exchange_idx on public.kazper_feedback (exchange_id);
create index if not exists kazper_reply_messages_exchange_idx on public.kazper_reply_messages (exchange_id);

alter table public.kazper_exchanges      enable row level security;
alter table public.kazper_reply_messages enable row level security;
alter table public.kazper_facts          enable row level security;
alter table public.kazper_feedback       enable row level security;
alter table public.kazper_events         enable row level security;
