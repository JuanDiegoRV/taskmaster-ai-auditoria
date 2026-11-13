-- Pruebas preparadas para Supabase local/pgTAP.
-- No ejecutadas en este entorno: no hay instancia PostgreSQL/Supabase disponible.

begin;

select plan(9);

select ok(
  not has_function_privilege('anon', 'public.set_updated_at()', 'EXECUTE'),
  'anon cannot execute the updated_at trigger function'
);
select ok(
  not has_function_privilege('authenticated', 'public.set_updated_at()', 'EXECUTE'),
  'authenticated cannot execute the updated_at trigger function'
);
select ok(
  not has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE'),
  'anon cannot execute the auth trigger function'
);
select ok(
  not has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE'),
  'authenticated cannot execute the auth trigger function'
);
select ok(
  not has_function_privilege('anon', 'public.add_project_owner_member()', 'EXECUTE'),
  'anon cannot execute the owner-membership trigger function'
);
select ok(
  not has_function_privilege('authenticated', 'public.add_project_owner_member()', 'EXECUTE'),
  'authenticated cannot execute the owner-membership trigger function'
);

create temporary table taskmaster_hardening_fixture (
  owner_id uuid not null,
  admin_id uuid not null,
  member_id uuid not null,
  outsider_id uuid not null,
  project_id uuid not null
) on commit drop;

do $$
declare
  owner_id uuid := gen_random_uuid();
  admin_id uuid := gen_random_uuid();
  member_id uuid := gen_random_uuid();
  outsider_id uuid := gen_random_uuid();
  project_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, aud, role, email)
  values
    (owner_id, 'authenticated', 'authenticated', owner_id::text || '@test.invalid'),
    (admin_id, 'authenticated', 'authenticated', admin_id::text || '@test.invalid'),
    (member_id, 'authenticated', 'authenticated', member_id::text || '@test.invalid'),
    (outsider_id, 'authenticated', 'authenticated', outsider_id::text || '@test.invalid');

  insert into public.projects (id, name, owner_id)
  values (project_id, 'Hardening project', owner_id);

  insert into public.project_members (project_id, user_id, role)
  values
    (project_id, admin_id, 'admin'),
    (project_id, member_id, 'member');

  insert into taskmaster_hardening_fixture
  values (owner_id, admin_id, member_id, outsider_id, project_id);
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', admin_id::text, true)
from taskmaster_hardening_fixture;

select throws_ok(
  $$ insert into public.project_members (project_id, user_id, role)
     values ((select project_id from taskmaster_hardening_fixture),
             (select outsider_id from taskmaster_hardening_fixture), 'owner') $$,
  '42501',
  null,
  'admin cannot create an owner membership'
);

select throws_ok(
  $$ update public.project_members
     set role = 'owner'
     where project_id = (select project_id from taskmaster_hardening_fixture)
       and user_id = (select member_id from taskmaster_hardening_fixture) $$,
  '42501',
  null,
  'admin cannot promote an existing member to owner'
);

select set_config('request.jwt.claim.sub', owner_id::text, true)
from taskmaster_hardening_fixture;

update public.project_members
set role = 'owner'
where project_id = (select project_id from taskmaster_hardening_fixture)
  and user_id = (select member_id from taskmaster_hardening_fixture);

select is(
  (select role::text from public.project_members
   where project_id = (select project_id from taskmaster_hardening_fixture)
     and user_id = (select member_id from taskmaster_hardening_fixture)),
  'owner',
  'owner can grant owner membership deliberately'
);

select * from finish();
rollback;
