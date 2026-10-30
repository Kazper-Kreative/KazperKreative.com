-- ===========================================================================
-- Jimothy store: live at 04:30 UTC on 30 Oct 2026, not 12:00 (Kazper, brought
-- forward to test a real purchase before players arrive). Moves the creator-
-- gift cutoff from jimothy_creator_gifts_2026-10-28.sql with STORE_LIVE_AT in
-- src/lib/jimothy/steam.ts. Rows already written keep the gift flag they got.
-- ===========================================================================

alter table public.jimothy_ledger
  alter column gift set default (now() < timestamptz '2026-10-30 04:30:00+00');

alter table public.jimothy_owned_skins
  alter column gift set default (now() < timestamptz '2026-10-30 04:30:00+00');
