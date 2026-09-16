-- Run read-only in the source project's SQL editor. Save the single JSON value
-- to migration-private/source.json on a trusted device, never in a chat or Git.
-- Contains password hashes and personal study data. No sessions/tokens exported.
-- Pause source writes before the final snapshot / production cutover.
begin transaction isolation level repeatable read read only;
select jsonb_build_object(
  'formatVersion', 1,
  'exportedAt', now(),
  'users', coalesce((select jsonb_agg(jsonb_build_object(
    'id', id, 'email', email, 'encrypted_password', encrypted_password,
    'email_confirmed_at', email_confirmed_at, 'banned_until', banned_until,
    'is_anonymous', is_anonymous, 'phone', phone,
    'display_name', coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '')
  )) from auth.users), '[]'::jsonb),
  'identities', coalesce((select jsonb_agg(jsonb_build_object(
    'user_id', user_id, 'provider', provider,
    'provider_id', provider_id
  )) from auth.identities), '[]'::jsonb),
  'mfaFactorCount', (select count(*) from auth.mfa_factors),
  'profiles', coalesce((select jsonb_agg(to_jsonb(p)) from public.profiles p), '[]'::jsonb),
  'courses', coalesce((select jsonb_agg(to_jsonb(c)) from public.courses c), '[]'::jsonb),
  'tasks', coalesce((select jsonb_agg(to_jsonb(t)) from public.tasks t), '[]'::jsonb),
  'events', coalesce((select jsonb_agg(to_jsonb(e)) from public.events e), '[]'::jsonb),
  'books', coalesce((select jsonb_agg(to_jsonb(b)) from public.books b), '[]'::jsonb)
) as snapshot;
commit;
