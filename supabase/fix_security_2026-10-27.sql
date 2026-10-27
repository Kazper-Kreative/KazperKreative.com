-- ===========================================================================
-- Security fixes, 27 Oct 2026 (from the read-only audit).
--
-- 1. submissions: read/update/delete were `using (true)` for ANY authenticated
--    user. Because /lab and /portal let anyone create an account via magic
--    link, any stranger could read or wipe every lead. Now staff-only, via the
--    same private.is_billing_staff() check the billing tables use.
--    Public INSERT (the contact/join forms) is unchanged.
-- 2. kazper_*: RLS was already deny-all; also revoke the default table grants
--    from anon/authenticated as defence in depth. Kazper uses the service role.
-- ===========================================================================
begin;

drop policy if exists "owner can read"   on public.submissions;
drop policy if exists "owner can update" on public.submissions;
drop policy if exists "owner can delete" on public.submissions;

create policy "staff can read" on public.submissions for select to authenticated
  using ((select private.is_billing_staff()));
create policy "staff can update" on public.submissions for update to authenticated
  using ((select private.is_billing_staff())) with check ((select private.is_billing_staff()));
create policy "staff can delete" on public.submissions for delete to authenticated
  using ((select private.is_billing_staff()));

revoke all on public.kazper_exchanges, public.kazper_reply_messages, public.kazper_facts,
              public.kazper_feedback, public.kazper_events
  from anon, authenticated;

commit;
