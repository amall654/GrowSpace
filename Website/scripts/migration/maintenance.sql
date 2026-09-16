-- Temporary, reversible write freeze during the final snapshot and cutover.
-- Reads continue. No existing data or policies are removed.
begin;
create function public.growspace_migration_readonly() returns trigger
language plpgsql as $$ begin
  raise exception 'GrowSpace migration maintenance: writes temporarily paused';
end; $$;
do $$ declare target text; begin
  foreach target in array array['auth.users','auth.identities','public.profiles','public.courses','public.tasks','public.events','public.books'] loop
    execute format('create trigger growspace_migration_readonly before insert or update or delete on %s for each statement execute function public.growspace_migration_readonly()',target);
  end loop;
end; $$;
commit;
