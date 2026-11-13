-- TaskMaster AI - pruebas SQL de integridad y RLS
-- Preparadas para Supabase local con pgTAP. No ejecutadas en este entorno.
-- El fixture se crea dentro de una transacción y se revierte al terminar.

begin;

select plan(10);

create temporary table taskmaster_security_fixture (
  owner_id uuid not null,
  outsider_id uuid not null,
  project_id uuid not null,
  protected_target_project_id uuid not null,
  outsider_project_id uuid not null,
  task_id uuid not null,
  comment_id uuid not null
) on commit drop;

do $$
declare
  owner_id uuid := gen_random_uuid();
  outsider_id uuid := gen_random_uuid();
  project_id uuid := gen_random_uuid();
  protected_target_project_id uuid := gen_random_uuid();
  outsider_project_id uuid := gen_random_uuid();
  task_id uuid := gen_random_uuid();
  comment_id uuid := gen_random_uuid();
begin
  -- Fixture privilegiado; después se cambia a authenticated para probar RLS.
  insert into auth.users (id, aud, role, email)
  values
    (owner_id, 'authenticated', 'authenticated', owner_id::text || '@test.invalid'),
    (outsider_id, 'authenticated', 'authenticated', outsider_id::text || '@test.invalid');

  insert into public.projects (id, name, owner_id)
  values
    (project_id, 'Security project', owner_id),
    (protected_target_project_id, 'Authorized target project', outsider_id),
    (outsider_project_id, 'Outsider project', outsider_id);

  insert into public.project_members (project_id, user_id, role)
  values
    (project_id, outsider_id, 'member'),
    (protected_target_project_id, owner_id, 'member');

  insert into public.tasks (id, project_id, title, creator_id)
  values (task_id, project_id, 'Original title', owner_id);

  insert into public.comments (id, task_id, project_id, author_id, body)
  values (comment_id, task_id, project_id, owner_id, 'Original comment');

  insert into taskmaster_security_fixture
  values (owner_id, outsider_id, project_id, protected_target_project_id, outsider_project_id, task_id, comment_id);

  grant select on taskmaster_security_fixture to authenticated;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', owner_id::text, true)
from taskmaster_security_fixture;

update public.tasks
set title = 'Updated legitimately', description = 'Allowed content change'
where id = (select task_id from taskmaster_security_fixture);
select is((select title from public.tasks where id = (select task_id from taskmaster_security_fixture)), 'Updated legitimately', 'allows legitimate task content update');

select throws_ok(
  $$ update public.tasks set project_id = (select protected_target_project_id from taskmaster_security_fixture) where id = (select task_id from taskmaster_security_fixture) $$,
  '42501',
  'Task identity and project ownership fields are immutable',
  'rejects task project reassignment'
);

select throws_ok(
  $$ update public.tasks set creator_id = (select outsider_id from taskmaster_security_fixture) where id = (select task_id from taskmaster_security_fixture) $$,
  '42501',
  'Task identity and project ownership fields are immutable',
  'rejects task creator reassignment'
);

select throws_ok(
  $$ update public.comments set project_id = (select protected_target_project_id from taskmaster_security_fixture) where id = (select comment_id from taskmaster_security_fixture) $$,
  '42501',
  'Comment identity and project ownership fields are immutable',
  'rejects comment project reassignment'
);

select throws_ok(
  $$ update public.comments set task_id = gen_random_uuid() where id = (select comment_id from taskmaster_security_fixture) $$,
  '42501',
  'Comment identity and project ownership fields are immutable',
  'rejects comment task reassignment'
);

select throws_ok(
  $$ update public.comments set author_id = (select outsider_id from taskmaster_security_fixture) where id = (select comment_id from taskmaster_security_fixture) $$,
  '42501',
  'Comment identity and project ownership fields are immutable',
  'rejects comment author reassignment'
);

select is(
  (select count(*)::integer from public.tasks where project_id = (select outsider_project_id from taskmaster_security_fixture)),
  0,
  'does not expose tasks from an unrelated project'
);

with changed as (
  update public.tasks
  set title = 'Should not update'
  where project_id = (select outsider_project_id from taskmaster_security_fixture)
  returning 1
)
select is((select count(*)::integer from changed), 0, 'does not update tasks from an unrelated project');

select is(
  (select count(*)::integer from public.comments where project_id = (select outsider_project_id from taskmaster_security_fixture)),
  0,
  'does not expose comments from an unrelated project'
);

select ok(
  (select title = 'Updated legitimately' from public.tasks where id = (select task_id from taskmaster_security_fixture)),
  'legitimate update remains persisted'
);

select * from finish();
rollback;
