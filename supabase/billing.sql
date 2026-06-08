-- ===========================================================================
-- Client billing portal (Phase 1) — clients, email-based access, invoices.
-- Run once in the Supabase SQL editor (project lenbcecnvjaylhigtlfl).
--
-- Model:
--   app_staff       — Kazper team members (admins). Seeded by SQL only.
--   clients         — the companies you bill.
--   client_invites  — grants a client-org's invoices to an EMAIL. A user who
--                     signs in with that email sees those invoices (matched in
--                     RLS via auth.jwt()->>'email'); no auth.users lookup needed.
--   invoices        — one-off invoices a client pays via Stripe Checkout.
--
-- RLS:
--   * Staff (app_staff) can do everything (admin console uses the normal cookie
--     session — no service-role key required for admin work).
--   * A client can SELECT only the clients/invites/invoices tied to their email.
--   * Clients can never write; the Stripe webhook marks invoices paid using the
--     service-role key (bypasses RLS).
-- ===========================================================================

-- ── staff check (security definer so policies don't recurse on app_staff RLS) ──
create table if not exists public.app_staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.app_staff enable row level security;
drop policy if exists "staff: read own" on public.app_staff;
create policy "staff: read own" on public.app_staff for select using (auth.uid() = user_id);
-- (no insert/update/delete policy: seed staff from the SQL editor / service role)

create or replace function public.is_billing_staff() returns boolean
  language sql security definer stable set search_path = public as $$
    select exists (select 1 from public.app_staff where user_id = auth.uid());
$$;

-- helper: the signed-in user's email, lowercased (for email-based client access)
create or replace function public.current_email() returns text
  language sql stable as $$
    select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- ── clients ────────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_name  text,
  contact_email text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
alter table public.clients enable row level security;
drop policy if exists "clients: staff all"  on public.clients;
drop policy if exists "clients: client read" on public.clients;
create policy "clients: staff all" on public.clients for all
  using (public.is_billing_staff()) with check (public.is_billing_staff());
create policy "clients: client read" on public.clients for select using (
  exists (select 1 from public.client_invites ci
          where ci.client_id = clients.id and lower(ci.email) = public.current_email())
);

-- ── client invites (email -> client access) ──────────────────────────────────
create table if not exists public.client_invites (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients(id) on delete cascade,
  email      text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (client_id, email)
);
alter table public.client_invites enable row level security;
create index if not exists client_invites_email_idx on public.client_invites (lower(email));
drop policy if exists "invites: staff all"  on public.client_invites;
drop policy if exists "invites: client read" on public.client_invites;
create policy "invites: staff all" on public.client_invites for all
  using (public.is_billing_staff()) with check (public.is_billing_staff());
create policy "invites: client read" on public.client_invites for select
  using (lower(email) = public.current_email());

-- ── invoices ─────────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id                         uuid primary key default gen_random_uuid(),
  client_id                  uuid not null references public.clients(id) on delete cascade,
  number                     text,
  title                      text not null,
  description                text,
  amount_cents               integer not null check (amount_cents >= 0),
  currency                   text not null default 'usd',
  status                     text not null default 'sent'
                               check (status in ('draft','sent','processing','paid','void')),
  due_date                   date,
  stripe_checkout_session_id text,
  stripe_payment_intent_id   text,
  paid_at                    timestamptz,
  created_by                 uuid references auth.users(id),
  created_at                 timestamptz not null default now()
);
alter table public.invoices enable row level security;
create index if not exists invoices_client_idx on public.invoices (client_id, created_at desc);
drop policy if exists "invoices: staff all"  on public.invoices;
drop policy if exists "invoices: client read" on public.invoices;
create policy "invoices: staff all" on public.invoices for all
  using (public.is_billing_staff()) with check (public.is_billing_staff());
create policy "invoices: client read" on public.invoices for select using (
  exists (select 1 from public.client_invites ci
          where ci.client_id = invoices.client_id and lower(ci.email) = public.current_email())
);

-- ── make yourself staff (run after signing in once at /portal or /lab) ───────
--   insert into public.app_staff (user_id)
--   select id from auth.users where email = 'mbell@sensorops.io'
--   on conflict (user_id) do nothing;
