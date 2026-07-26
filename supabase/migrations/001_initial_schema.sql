-- ============================================================
-- My Life Planner — Initial Schema
-- Run this in Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────
create table public.profiles (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid references auth.users(id) on delete cascade not null unique,
  full_name               text not null default '',
  avatar_url              text,
  routine_description     text default 'your normal routine',
  notification_time       time not null default '08:00',
  notifications_enabled   boolean not null default true,
  onboarding_completed    boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ─── Life Domains ────────────────────────────────────────────
create table public.life_domains (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  icon        text not null default '🎯',
  color       text not null default '#0ea5e9',
  sort_order  int not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── Life Goals ──────────────────────────────────────────────
create table public.life_goals (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  domain_id      uuid references public.life_domains(id) on delete set null,
  title          text not null,
  why            text not null default '',
  vision_statement text,
  time_horizon   text not null default 'yearly',
  status         text not null default 'active',
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── Priority Groups ─────────────────────────────────────────
create table public.priority_groups (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  letter      text not null,
  name        text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  unique(user_id, letter)
);

-- ─── Projects ────────────────────────────────────────────────
create table public.projects (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  goal_id             uuid references public.life_goals(id) on delete set null,
  parent_project_id   uuid references public.projects(id) on delete cascade,
  title               text not null,
  description         text,
  priority_group      text not null default 'A',
  priority_number     int not null default 1,
  status              text not null default 'active',
  time_horizon        text not null default 'monthly',
  due_date            date,
  sort_order          int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── Tasks ───────────────────────────────────────────────────
create table public.tasks (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid references public.projects(id) on delete cascade not null,
  assigned_to      uuid references auth.users(id) on delete set null,
  title            text not null,
  description      text,
  priority_group   text not null default 'A',
  priority_number  int not null default 1,
  status           text not null default 'pending',
  time_horizon     text not null default 'weekly',
  due_date         date,
  is_recurring     boolean not null default false,
  recurrence_rule  text,
  blocked_by       uuid[] default '{}',
  completed_at     timestamptz,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── Task History ────────────────────────────────────────────
create table public.task_history (
  id            uuid primary key default uuid_generate_v4(),
  task_id       uuid references public.tasks(id) on delete set null,
  project_id    uuid references public.projects(id) on delete set null,
  user_id       uuid references auth.users(id) on delete cascade not null,
  action        text not null,
  before_state  jsonb,
  after_state   jsonb,
  description   text not null,
  depends_on    uuid[] default '{}',
  created_at    timestamptz not null default now()
);

-- ─── Workspace (Family) ──────────────────────────────────────
create table public.workspaces (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table public.workspace_members (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid references public.workspaces(id) on delete cascade not null,
  user_id       uuid references auth.users(id) on delete cascade not null,
  role          text not null default 'basic_editor',
  invited_by    uuid references auth.users(id) on delete set null,
  joined_at     timestamptz,
  created_at    timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- ─── Saved Views ─────────────────────────────────────────────
create table public.saved_views (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  name             text not null,
  project_configs  jsonb not null default '[]',
  sort_by          text not null default 'priority',
  created_at       timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.life_domains      enable row level security;
alter table public.life_goals        enable row level security;
alter table public.priority_groups   enable row level security;
alter table public.projects          enable row level security;
alter table public.tasks             enable row level security;
alter table public.task_history      enable row level security;
alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.saved_views       enable row level security;

-- Profiles: users can only see/edit their own
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = user_id);

-- Domains, Goals, Priority Groups, Saved Views: own rows only
create policy "domains_own" on public.life_domains
  for all using (auth.uid() = user_id);
create policy "goals_own" on public.life_goals
  for all using (auth.uid() = user_id);
create policy "priority_groups_own" on public.priority_groups
  for all using (auth.uid() = user_id);
create policy "saved_views_own" on public.saved_views
  for all using (auth.uid() = user_id);

-- Projects: own rows, or workspace members
create policy "projects_own" on public.projects
  for all using (auth.uid() = user_id);

-- Tasks: own project's tasks, or assigned to me
create policy "tasks_own_project" on public.tasks
  for all using (
    project_id in (select id from public.projects where user_id = auth.uid())
    or assigned_to = auth.uid()
  );

-- Task history: own rows
create policy "history_own" on public.task_history
  for all using (auth.uid() = user_id);

-- Workspaces: owner
create policy "workspaces_owner" on public.workspaces
  for all using (auth.uid() = owner_id);

-- Workspace members: members of the workspace can view; owner can manage
create policy "workspace_members_view" on public.workspace_members
  for select using (
    user_id = auth.uid()
    or workspace_id in (select id from public.workspaces where owner_id = auth.uid())
  );
create policy "workspace_members_manage" on public.workspace_members
  for all using (
    workspace_id in (select id from public.workspaces where owner_id = auth.uid())
  );

-- ============================================================
-- Auto-create profile & default data on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  -- Create profile
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));

  -- Create default priority groups
  insert into public.priority_groups (user_id, letter, name, sort_order) values
    (new.id, 'A', 'Required',     1),
    (new.id, 'B', 'Should-Do',    2),
    (new.id, 'C', 'Nice-To-Have', 3);

  -- Create default life domains
  insert into public.life_domains (user_id, name, icon, color, sort_order) values
    (new.id, 'Faith & Spirituality',  '✝️', '#7e22ce', 1),
    (new.id, 'Health & Fitness',      '💪', '#16a34a', 2),
    (new.id, 'Relationships & Family','❤️', '#dc2626', 3),
    (new.id, 'Career & Work',         '💼', '#0369a1', 4),
    (new.id, 'Finances',              '💰', '#ca8a04', 5),
    (new.id, 'Personal Growth',       '🌱', '#059669', 6),
    (new.id, 'Fun & Hobbies',         '🎯', '#ea580c', 7),
    (new.id, 'Community & Legacy',    '🌍', '#0891b2', 8);

  -- Create personal workspace
  insert into public.workspaces (owner_id, name)
  values (new.id, 'My Family')
  returning id into new_workspace_id;

  -- Add owner as workspace member
  insert into public.workspace_members (workspace_id, user_id, role, joined_at)
  values (new_workspace_id, new.id, 'owner', now());

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Helpful indexes
-- ============================================================

create index idx_projects_user      on public.projects(user_id);
create index idx_projects_goal      on public.projects(goal_id);
create index idx_projects_parent    on public.projects(parent_project_id);
create index idx_projects_priority  on public.projects(user_id, priority_group, priority_number);
create index idx_tasks_project      on public.tasks(project_id);
create index idx_tasks_priority     on public.tasks(project_id, priority_group, priority_number);
create index idx_tasks_assigned     on public.tasks(assigned_to);
create index idx_history_task       on public.task_history(task_id);
create index idx_history_user       on public.task_history(user_id);
