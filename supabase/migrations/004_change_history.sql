-- Migration 004: General change history for auto-save undo/redo
-- Run this in Supabase SQL Editor

create table if not exists public.change_history (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  entity_type   text not null,     -- 'task' | 'project' | 'goal' | 'domain' | 'profile'
  entity_id     uuid not null,
  action        text not null,     -- 'created' | 'updated' | 'deleted'
  field_changed text,              -- specific field if only one field changed
  before_state  jsonb,
  after_state   jsonb,
  description   text not null,     -- human-readable: "Updated task title"
  is_undone     boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.change_history enable row level security;

create policy "change_history_own" on public.change_history
  for all using (auth.uid() = user_id);

-- Fast lookup: user's undo-able history, newest first
create index idx_change_history_undo
  on public.change_history (user_id, is_undone, created_at desc);

-- Fast lookup by entity
create index idx_change_history_entity
  on public.change_history (entity_type, entity_id);

-- Also grant service_role access for backups
grant select on public.change_history to service_role;

-- Add undo_limit to profiles so users can configure it (default 50)
alter table public.profiles
  add column if not exists undo_limit int not null default 50;
