-- TaskMaster AI - Sprint 4
-- Preparación local de Realtime. Esta migración NO se ejecuta remotamente en este sprint.

-- Supabase Realtime necesita que la tabla pertenezca a la publicación.
-- El bloque hace la operación idempotente para no duplicar la relación.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'tasks'
     ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
end;
$$;

-- Permite que DELETE incluya los valores anteriores necesarios para filtros y
-- refresco. RLS sigue siendo la barrera de acceso para los clientes.
alter table public.tasks replica identity full;
