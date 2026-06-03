-- ===========================================================================
-- Lab membership / entitlements for the paywall.
-- Run once in the Supabase SQL editor (project lenbcecnvjaylhigtlfl).
-- The app gates /lab + /lab-assets on a row here with status 'active' (paid)
-- or 'comp' (manually granted). Writes happen via the service role only
-- (manual grant + the Stripe webhook); clients can read only their own row.
-- ===========================================================================

create table if not exists public.lab_members (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  status                 text not null default 'none',  -- none | active | comp | past_due | canceled
  plan                   text,
  current_period_end     timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  updated_at             timestamptz not null default now()
);

alter table public.lab_members enable row level security;

-- A signed-in user may read ONLY their own membership row.
drop policy if exists "read own membership" on public.lab_members;
create policy "read own membership"
  on public.lab_members for select
  using (auth.uid() = user_id);

-- (No client INSERT/UPDATE/DELETE policy on purpose — only the service-role
--  key writes here, which bypasses RLS: manual grants + the Stripe webhook.)

-- ───────────────────────────────────────────────────────────────────────────
-- MANUAL GRANT — give someone free ("comp") access after they've signed up
-- (signed in once via magic link, which creates their auth.users row):
--
--   insert into public.lab_members (user_id, status, plan)
--   select id, 'comp', 'comp' from auth.users where email = 'them@example.com'
--   on conflict (user_id) do update
--     set status = 'comp', plan = 'comp', updated_at = now();
--
-- REVOKE:
--   update public.lab_members set status = 'canceled', updated_at = now()
--   where user_id = (select id from auth.users where email = 'them@example.com');
-- ───────────────────────────────────────────────────────────────────────────
