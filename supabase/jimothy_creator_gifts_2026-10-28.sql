-- ===========================================================================
-- Jimothy store: everything before going live is a gift to the creators.
--
-- The store sold in Steam's sandbox until release (Friday 30 Oct 2026, 8:00
-- ET = 12:00 UTC, STORE_LIVE_AT in src/lib/jimothy/steam.ts). The Racoins and
-- skins it gave out then are kept -- the team's own -- but are not sales, and
-- no stat may count them (Kazper, 28 Oct).
--
-- Orders already say so (sandbox). The ledger and owned skins get `gift`:
-- true for every row written before the go-live moment, existing rows
-- included, false after. Move this time with STORE_LIVE_AT.
--
-- For stats: orders where not sandbox, ledger and skins where not gift. The
-- two views below do that, so nobody has to remember. Racoins left in a
-- creator's wallet and spent after launch do log as ordinary skin rows.
-- ===========================================================================

alter table public.jimothy_ledger
  add column if not exists gift boolean not null
  default (now() < timestamptz '2026-10-30 12:00:00+00');

alter table public.jimothy_owned_skins
  add column if not exists gift boolean not null
  default (now() < timestamptz '2026-10-30 12:00:00+00');

-- Real money only: finalized live orders.
create or replace view public.jimothy_sales
with (security_invoker = true) as
select order_id, steam_id, pack_id, racoins, amount_cents, currency, trans_id, finalized_at
  from public.jimothy_orders
 where not sandbox and status = 'finalized';

-- Skins bought after launch.
create or replace view public.jimothy_skin_sales
with (security_invoker = true) as
select steam_id, skin_id, price, acquired_at
  from public.jimothy_owned_skins
 where not gift;

revoke all on public.jimothy_sales, public.jimothy_skin_sales from public, anon, authenticated;
