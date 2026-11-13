-- TaskMaster AI - Sprint 1 hardening
-- Protege identidad y pertenencia frente a UPDATE directos. Esta migración
-- se prepara localmente y NO se ejecuta remotamente en este sprint.

create or replace function public.prevent_task_identity_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
     or new.project_id is distinct from old.project_id
     or new.creator_id is distinct from old.creator_id
     or new.created_at is distinct from old.created_at then
    raise exception using
      errcode = '42501',
      message = 'Task identity and project ownership fields are immutable';
  end if;
  return new;
end;
$$;

create trigger tasks_protect_identity_fields
before update on public.tasks
for each row execute function public.prevent_task_identity_change();

create or replace function public.prevent_comment_identity_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
     or new.task_id is distinct from old.task_id
     or new.project_id is distinct from old.project_id
     or new.author_id is distinct from old.author_id
     or new.created_at is distinct from old.created_at then
    raise exception using
      errcode = '42501',
      message = 'Comment identity and project ownership fields are immutable';
  end if;
  return new;
end;
$$;

create trigger comments_protect_identity_fields
before update on public.comments
for each row execute function public.prevent_comment_identity_change();

create or replace function public.prevent_project_owner_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
     or new.owner_id is distinct from old.owner_id
     or new.created_at is distinct from old.created_at then
    raise exception using
      errcode = '42501',
      message = 'Project identity and owner fields are immutable';
  end if;
  return new;
end;
$$;

create trigger projects_protect_owner_fields
before update on public.projects
for each row execute function public.prevent_project_owner_change();

create or replace function public.prevent_membership_identity_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.project_id is distinct from old.project_id
     or new.user_id is distinct from old.user_id
     or new.created_at is distinct from old.created_at then
    raise exception using
      errcode = '42501',
      message = 'Membership identity fields are immutable';
  end if;
  return new;
end;
$$;

create trigger project_members_protect_identity_fields
before update on public.project_members
for each row execute function public.prevent_membership_identity_change();

-- Estas funciones solo son invocadas por triggers. Se revoca la ejecución
-- directa para reducir la superficie pública sin alterar las políticas RLS.
revoke all on function public.prevent_task_identity_change() from public, anon, authenticated;
revoke all on function public.prevent_comment_identity_change() from public, anon, authenticated;
revoke all on function public.prevent_project_owner_change() from public, anon, authenticated;
revoke all on function public.prevent_membership_identity_change() from public, anon, authenticated;
