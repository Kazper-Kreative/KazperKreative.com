-- ===========================================================================
-- Database advisor fixes, part B, 25 Oct 2026: the Resend key into Vault.
-- Run in the Supabase SQL editor (it writes a secret, so it is yours to run).
-- Then ROTATE the key in Resend and paste the new one into the Vault secret
-- 'resend_api_key' (Dashboard -> Project Settings -> Vault).
-- ===========================================================================
begin;

-- ---------------------------------------------------------------------------
-- 1. The Resend key out of the trigger's source and into Vault.
--
-- notify_new_submission() carried the API key in its body, readable by anyone
-- who can read function definitions. Copied into Vault from the old body (so
-- it is never retyped), and the function reads it from there. ROTATE THE KEY
-- in Resend afterwards and update the Vault secret 'resend_api_key' (Dashboard
-- -> Project Settings -> Vault): the old one sat in plain text.
-- ---------------------------------------------------------------------------
do $$
declare
  old_key text;
begin
  if not exists (select 1 from vault.secrets where name = 'resend_api_key') then
    select substring(pg_get_functiondef('public.notify_new_submission()'::regprocedure)
                     from 'Bearer (re_[A-Za-z0-9_]+)')
      into old_key;
    if old_key is null then
      raise exception 'no Resend key found in notify_new_submission(); nothing changed';
    end if;
    perform vault.create_secret(old_key, 'resend_api_key',
      'Resend API key for the new-submission email trigger');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- The trigger reads the key from Vault.
create or replace function public.notify_new_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resend_key text;
begin
  select decrypted_secret into resend_key
    from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  -- No key, no email -- never a lost submission.
  if resend_key is null then
    return new;
  end if;
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || resend_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'Kazper Kreative <onboarding@resend.dev>',
      'to', 'kazper@kazperkreative.com',
      'subject', 'New ' || coalesce(new.type, 'submission') || ' — kazperkreative.com',
      'html', '<p>New <b>' || coalesce(new.type, 'submission') || '</b> received.</p><pre>'
              || coalesce(new.fields::text, '') || '</pre><p>Open your inbox to read &amp; reply.</p>'
    )
  );
  return new;
end;
$$;
revoke execute on function public.notify_new_submission() from public, anon, authenticated;


commit;
