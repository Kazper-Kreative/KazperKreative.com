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

-- ---------------------------------------------------------------------------
-- 2026-10-27: efficiency + learning. Safe to re-run.

-- What kind of turn an exchange was. Only 'chat' is replayed as conversation
-- history; briefings and weekly reviews stay searchable but out of the window.
alter table public.kazper_exchanges
  add column if not exists kind text not null default 'chat' check (kind in ('chat', 'briefing', 'review'));
update public.kazper_exchanges set kind = 'briefing'
  where kind = 'chat' and (user_text like '[Scheduled]%' or user_text like '[On demand]%');

-- What each exchange cost, summed over every LLM round in it (OpenRouter usage accounting).
alter table public.kazper_exchanges
  add column if not exists llm_calls         int,
  add column if not exists prompt_tokens     int,
  add column if not exists cached_tokens     int,
  add column if not exists completion_tokens int,
  add column if not exists reasoning_tokens  int,
  add column if not exists cost_usd          numeric(12, 6),
  add column if not exists providers         text;

-- Full-text search over past conversation, so Kazper can recall instead of replaying.
alter table public.kazper_exchanges
  add column if not exists search tsvector
  generated always as (to_tsvector('english', coalesce(user_text, '') || ' ' || coalesce(reply_text, ''))) stored;
create index if not exists kazper_exchanges_search_idx on public.kazper_exchanges using gin (search);
create index if not exists kazper_exchanges_created_at_idx on public.kazper_exchanges (created_at desc);

-- Kazper's working notes to itself ("open: Dana's tax docs, see #42"), linked to the exchange they came from.
create table if not exists public.kazper_pointers (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  text         text not null,
  exchange_id  bigint references public.kazper_exchanges(id) on delete set null
);
alter table public.kazper_pointers enable row level security;

-- 'redirect': you pushed back in plain chat ("no, I meant…") — an implicit correction.
alter table public.kazper_feedback drop constraint if exists kazper_feedback_kind_check;
alter table public.kazper_feedback
  add constraint kazper_feedback_kind_check check (kind in ('good', 'bad', 'correction', 'redirect'));

-- ---------------------------------------------------------------------------
-- 2026-10-27: the /kazper web app. Safe to re-run.

-- Which door a message came through. Discord and the web app share one conversation.
alter table public.kazper_exchanges
  add column if not exists channel text not null default 'discord' check (channel in ('discord', 'web'));

-- Who may open /kazper. Deliberately separate from app_staff: billing staff don't get Kazper.
-- Seeded by SQL only, never from the app.
create table if not exists public.kazper_owners (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.kazper_owners enable row level security;
insert into public.kazper_owners (user_id)
  select id from auth.users where email = 'kazperkreative@gmail.com'
  on conflict do nothing;

create or replace function public.is_kazper_owner() returns boolean
  language sql security definer stable set search_path = public as $$
    select exists (select 1 from public.kazper_owners where user_id = auth.uid());
$$;
revoke all on function public.is_kazper_owner() from public;
grant execute on function public.is_kazper_owner() to authenticated;

-- The owner reads Kazper's memory with their normal login (no service key in the browser).
-- Writes are limited to curating memory: editing/deleting facts and pointers, adding facts.
drop policy if exists "owner reads" on public.kazper_owners;
create policy "owner reads" on public.kazper_owners for select using (user_id = auth.uid());

drop policy if exists "owner reads" on public.kazper_exchanges;
create policy "owner reads" on public.kazper_exchanges for select using (public.is_kazper_owner());

drop policy if exists "owner curates" on public.kazper_facts;
create policy "owner curates" on public.kazper_facts for all
  using (public.is_kazper_owner()) with check (public.is_kazper_owner());

drop policy if exists "owner curates" on public.kazper_pointers;
create policy "owner curates" on public.kazper_pointers for all
  using (public.is_kazper_owner()) with check (public.is_kazper_owner());

drop policy if exists "owner reads" on public.kazper_feedback;
create policy "owner reads" on public.kazper_feedback for select using (public.is_kazper_owner());

drop policy if exists "owner reads" on public.kazper_events;
create policy "owner reads" on public.kazper_events for select using (public.is_kazper_owner());
