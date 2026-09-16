-- Rollback only: resume the old application if cutover is abandoned.
begin;
do $$ declare target text; begin
  foreach target in array array['auth.users','auth.identities','public.profiles','public.courses','public.tasks','public.events','public.books'] loop
    execute format('drop trigger if exists growspace_migration_readonly on %s',target);
  end loop;
end; $$;
drop function if exists public.growspace_migration_readonly();
commit;
