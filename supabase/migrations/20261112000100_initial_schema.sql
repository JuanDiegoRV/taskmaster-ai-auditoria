-- TaskMaster AI - Sprint 1
-- Modelo inicial y RLS. Esta migración se prepara localmente y NO se ejecuta remotamente.

create extension if not exists pgcrypto;

create type public.project_role as enum ('owner', 'admin', 'member', 'viewer');
create type public.task_status as enum ('todo', 'in_progress', 'done', 'cancelled');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.project_role not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (project_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  creator_id uuid not null references public.profiles (id) on delete restrict,
  assignee_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.tasks
  add constraint tasks_project_id_id_key unique (project_id, id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint comments_task_belongs_to_project_fk
    foreign key (project_id, task_id)
    references public.tasks (project_id, id)
    on delete cascade
);

create index project_members_user_id_idx on public.project_members (user_id);
create index tasks_project_status_idx on public.tasks (project_id, status);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index comments_task_created_at_idx on public.comments (task_id, created_at);
create index comments_project_created_at_idx on public.comments (project_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger project_members_set_updated_at
before update on public.project_members
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

-- Crea el perfil al registrar un usuario en Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.email), ''),
      'New user'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- SECURITY DEFINER evita que las políticas de project_members se llamen a sí mismas.
-- search_path fijo y calificación de objetos reducen el riesgo de shadowing.
create or replace function public.is_project_member(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = auth.uid()
  );
$$;

create or replace function public.has_project_role(
  target_project_id uuid,
  allowed_roles public.project_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = auth.uid()
      and pm.role = any (allowed_roles)
  );
$$;

revoke all on function public.is_project_member(uuid) from public;
grant execute on function public.is_project_member(uuid) to authenticated;
revoke all on function public.has_project_role(uuid, public.project_role[]) from public;
grant execute on function public.has_project_role(uuid, public.project_role[]) to authenticated;

-- Cada proyecto crea automáticamente la membresía owner del usuario creador.
create or replace function public.add_project_owner_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger projects_add_owner_member
after insert on public.projects
for each row execute function public.add_project_owner_member();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;

create policy profiles_select_self_or_collaborators
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.user_id = profiles.id
      and public.is_project_member(pm.project_id)
  )
);

create policy profiles_update_self
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy projects_select_members
on public.projects for select to authenticated
using (public.is_project_member(id));

create policy projects_insert_owner
on public.projects for insert to authenticated
with check (owner_id = auth.uid());

create policy projects_update_admins
on public.projects for update to authenticated
using (public.has_project_role(id, array['owner', 'admin']::public.project_role[]))
with check (public.has_project_role(id, array['owner', 'admin']::public.project_role[]));

create policy projects_delete_owner
on public.projects for delete to authenticated
using (owner_id = auth.uid() and public.has_project_role(id, array['owner']::public.project_role[]));

create policy project_members_select_members
on public.project_members for select to authenticated
using (public.is_project_member(project_id));

create policy project_members_insert_admins
on public.project_members for insert to authenticated
with check (public.has_project_role(project_id, array['owner', 'admin']::public.project_role[]));

create policy project_members_update_admins
on public.project_members for update to authenticated
using (public.has_project_role(project_id, array['owner', 'admin']::public.project_role[]))
with check (public.has_project_role(project_id, array['owner', 'admin']::public.project_role[]));

create policy project_members_delete_admins
on public.project_members for delete to authenticated
using (
  public.has_project_role(project_id, array['owner', 'admin']::public.project_role[])
  and role <> 'owner'
);

create policy tasks_select_members
on public.tasks for select to authenticated
using (public.is_project_member(project_id));

create policy tasks_insert_editors
on public.tasks for insert to authenticated
with check (
  creator_id = auth.uid()
  and public.has_project_role(project_id, array['owner', 'admin', 'member']::public.project_role[])
);

create policy tasks_update_editors
on public.tasks for update to authenticated
using (public.has_project_role(project_id, array['owner', 'admin', 'member']::public.project_role[]))
with check (public.is_project_member(project_id));

create policy tasks_delete_editors
on public.tasks for delete to authenticated
using (public.has_project_role(project_id, array['owner', 'admin', 'member']::public.project_role[]));

create policy comments_select_members
on public.comments for select to authenticated
using (public.is_project_member(project_id));

create policy comments_insert_members
on public.comments for insert to authenticated
with check (author_id = auth.uid() and public.is_project_member(project_id));

create policy comments_update_author_or_admin
on public.comments for update to authenticated
using (
  author_id = auth.uid()
  or public.has_project_role(project_id, array['owner', 'admin']::public.project_role[])
)
with check (public.is_project_member(project_id));

create policy comments_delete_author_or_admin
on public.comments for delete to authenticated
using (
  author_id = auth.uid()
  or public.has_project_role(project_id, array['owner', 'admin']::public.project_role[])
);
