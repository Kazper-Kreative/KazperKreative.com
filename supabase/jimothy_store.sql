-- ===========================================================================
-- Jimothy's Adventure: the Racoin store (Steam app 5082200).
-- Run once in the Supabase SQL editor (project lenbcecnvjaylhigtlfl).
--
-- Players buy Racoin packs with Steam in-game purchases (ISteamMicroTxn) and
-- spend Racoins on skins. Racoins cannot be earned in game (Kazper, 25 Oct
-- 2026), so this database is the only place a balance comes from.
--
-- Every table is service-role only: RLS on, no policies. The game never talks
-- to Supabase; it talks to /api/jimothy/*, which verifies the player with
-- Steam and writes here with the service-role key.
--
-- Money moves only through the two functions at the bottom, each one
-- transaction, so a retried or doubled request cannot credit or spend twice.
-- ===========================================================================

create table if not exists public.jimothy_wallets (
  steam_id   text primary key,
  balance    integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

-- Order ids are the 64-bit ids Steam's InitTxn requires; a sequence makes them
-- unique without the client choosing them.
create sequence if not exists public.jimothy_order_seq start 100000;

create table if not exists public.jimothy_orders (
  order_id     bigint primary key default nextval('public.jimothy_order_seq'),
  steam_id     text not null,
  pack_id      text not null,
  item_id      integer not null,          -- the itemid sent to Steam
  racoins      integer not null check (racoins > 0),
  amount_cents integer not null check (amount_cents > 0),
  currency     text not null default 'USD',
  sandbox      boolean not null,
  status       text not null default 'init', -- init | finalized | failed
  trans_id     text,
  created_at   timestamptz not null default now(),
  finalized_at timestamptz
);
create index if not exists jimothy_orders_steam on public.jimothy_orders (steam_id, created_at desc);

create table if not exists public.jimothy_owned_skins (
  steam_id    text not null,
  skin_id     text not null,
  price       integer not null,
  acquired_at timestamptz not null default now(),
  primary key (steam_id, skin_id)
);

-- Every change to a balance, with what caused it. The balance is the sum of a
-- player's ledger; the wallet row is the fast copy.
create table if not exists public.jimothy_ledger (
  id         bigint generated always as identity primary key,
  steam_id   text not null,
  delta      integer not null,
  reason     text not null,                -- pack | skin | grant | refund
  ref        text,                         -- order id or skin id
  created_at timestamptz not null default now()
);
create index if not exists jimothy_ledger_steam on public.jimothy_ledger (steam_id, created_at desc);

alter table public.jimothy_wallets     enable row level security;
alter table public.jimothy_orders      enable row level security;
alter table public.jimothy_owned_skins enable row level security;
alter table public.jimothy_ledger      enable row level security;

-- ---------------------------------------------------------------------------
-- Credit a finalized order. Idempotent: an order already finalized returns the
-- current balance and credits nothing.
-- ---------------------------------------------------------------------------
create or replace function public.jimothy_credit_order(p_order_id bigint, p_trans_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.jimothy_orders;
  new_balance integer;
begin
  select * into o from public.jimothy_orders where order_id = p_order_id for update;
  if not found then
    raise exception 'no_such_order';
  end if;

  if o.status = 'finalized' then
    select balance into new_balance from public.jimothy_wallets where steam_id = o.steam_id;
    return coalesce(new_balance, 0);
  end if;

  update public.jimothy_orders
     set status = 'finalized', trans_id = p_trans_id, finalized_at = now()
   where order_id = p_order_id;

  insert into public.jimothy_wallets (steam_id, balance)
  values (o.steam_id, o.racoins)
  on conflict (steam_id) do update
    set balance = public.jimothy_wallets.balance + excluded.balance, updated_at = now()
  returning balance into new_balance;

  insert into public.jimothy_ledger (steam_id, delta, reason, ref)
  values (o.steam_id, o.racoins, 'pack', p_order_id::text);

  return new_balance;
end;
$$;

-- ---------------------------------------------------------------------------
-- Spend Racoins on a skin. Fails with 'already_owned' or 'insufficient' and
-- changes nothing; otherwise debits, records the skin and returns the balance.
-- ---------------------------------------------------------------------------
create or replace function public.jimothy_buy_skin(p_steam_id text, p_skin_id text, p_price integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if p_price <= 0 then
    raise exception 'bad_price';
  end if;

  if exists (select 1 from public.jimothy_owned_skins where steam_id = p_steam_id and skin_id = p_skin_id) then
    raise exception 'already_owned';
  end if;

  update public.jimothy_wallets
     set balance = balance - p_price, updated_at = now()
   where steam_id = p_steam_id and balance >= p_price
  returning balance into new_balance;

  if not found then
    raise exception 'insufficient';
  end if;

  insert into public.jimothy_owned_skins (steam_id, skin_id, price)
  values (p_steam_id, p_skin_id, p_price);

  insert into public.jimothy_ledger (steam_id, delta, reason, ref)
  values (p_steam_id, -p_price, 'skin', p_skin_id);

  return new_balance;
end;
$$;

-- Only the service role may call them.
revoke all on function public.jimothy_credit_order(bigint, text) from public, anon, authenticated;
revoke all on function public.jimothy_buy_skin(text, text, integer) from public, anon, authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- GRANT Racoins by hand (support, a gift, a goodwill credit):
--
--   insert into public.jimothy_wallets (steam_id, balance) values ('7656119...', 500)
--   on conflict (steam_id) do update set balance = jimothy_wallets.balance + 500, updated_at = now();
--   insert into public.jimothy_ledger (steam_id, delta, reason, ref) values ('7656119...', 500, 'grant', 'support');
-- ───────────────────────────────────────────────────────────────────────────
