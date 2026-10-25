-- ===========================================================================
-- Database advisor fixes, part A, 25 Oct 2026 (project lenbcecnvjaylhigtlfl).
-- One transaction: all of it or none of it. Nothing here changes who can see
-- or do what; it changes how the same rules are written.
-- ===========================================================================
begin;

-- ---------------------------------------------------------------------------
-- 2. pg_net out of the public schema (extension_in_public).
-- Its functions live in schema net either way; only the extension's home moves.
-- ---------------------------------------------------------------------------
drop extension if exists pg_net;
create extension pg_net schema extensions;

-- ---------------------------------------------------------------------------
-- 3. The trigger function: a fixed search_path and no longer callable through
-- /rest/v1/rpc (a trigger fires whatever EXECUTE says). Its Resend key moves
-- to Vault in part B.
-- ---------------------------------------------------------------------------
alter function public.notify_new_submission() set search_path = '';
revoke execute on function public.notify_new_submission() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. current_email(): a fixed search_path. Everything in it is qualified.
-- ---------------------------------------------------------------------------
alter function public.current_email() set search_path = '';

-- ---------------------------------------------------------------------------
-- 5. is_billing_staff() out of the API. It is SECURITY DEFINER and the billing
-- policies need it, so it cannot simply be revoked; in schema private it is
-- no longer an /rest/v1/rpc endpoint. Policies hold it by reference, so they
-- follow it.
-- ---------------------------------------------------------------------------
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;
alter function public.is_billing_staff() set schema private;

-- ---------------------------------------------------------------------------
-- 6. Policies: auth calls once per query, not once per row (auth_rls_initplan),
-- and one permissive policy per role and action (multiple_permissive_policies).
-- Same rules as before.
-- ---------------------------------------------------------------------------

-- Own-row tables.
alter policy "read own membership" on public.lab_members using ((select auth.uid()) = user_id);
alter policy "staff: read own" on public.app_staff using ((select auth.uid()) = user_id);
alter policy "games: read own" on public.chess_games using ((select auth.uid()) = user_id);
alter policy "games: insert own" on public.chess_games with check ((select auth.uid()) = user_id);
alter policy "games: delete own" on public.chess_games using ((select auth.uid()) = user_id);

-- "write own" was FOR ALL, which already covers reading; the separate read
-- policy was the duplicate.
drop policy "stats: read own" on public.game_stats;
alter policy "stats: write own" on public.game_stats
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "profiles: read own" on public.lab_profiles;
alter policy "profiles: write own" on public.lab_profiles
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Billing: a client reads their own; staff do everything. One SELECT policy
-- holding both, and staff's writes split out of FOR ALL.
drop policy "invites: client read" on public.client_invites;
drop policy "invites: staff all" on public.client_invites;
create policy "invites: read" on public.client_invites for select
  using (lower(email) = (select public.current_email()) or (select private.is_billing_staff()));
create policy "invites: staff insert" on public.client_invites for insert
  with check ((select private.is_billing_staff()));
create policy "invites: staff update" on public.client_invites for update
  using ((select private.is_billing_staff())) with check ((select private.is_billing_staff()));
create policy "invites: staff delete" on public.client_invites for delete
  using ((select private.is_billing_staff()));

drop policy "clients: client read" on public.clients;
drop policy "clients: staff all" on public.clients;
create policy "clients: read" on public.clients for select
  using (
    exists (select 1 from public.client_invites ci
            where ci.client_id = clients.id and lower(ci.email) = (select public.current_email()))
    or (select private.is_billing_staff())
  );
create policy "clients: staff insert" on public.clients for insert
  with check ((select private.is_billing_staff()));
create policy "clients: staff update" on public.clients for update
  using ((select private.is_billing_staff())) with check ((select private.is_billing_staff()));
create policy "clients: staff delete" on public.clients for delete
  using ((select private.is_billing_staff()));

drop policy "invoices: client read" on public.invoices;
drop policy "invoices: staff all" on public.invoices;
create policy "invoices: read" on public.invoices for select
  using (
    exists (select 1 from public.client_invites ci
            where ci.client_id = invoices.client_id and lower(ci.email) = (select public.current_email()))
    or (select private.is_billing_staff())
  );
create policy "invoices: staff insert" on public.invoices for insert
  with check ((select private.is_billing_staff()));
create policy "invoices: staff update" on public.invoices for update
  using ((select private.is_billing_staff())) with check ((select private.is_billing_staff()));
create policy "invoices: staff delete" on public.invoices for delete
  using ((select private.is_billing_staff()));

commit;

-- Not fixable from SQL: "Leaked password protection" is an Auth setting
-- (Dashboard -> Authentication -> Providers -> Email -> Prevent use of leaked
-- passwords; a Pro-plan feature).
