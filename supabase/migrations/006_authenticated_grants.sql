-- Migration 006: Let signed-in users read/write their own data
-- Run this in Supabase SQL Editor
--
-- Fixes: "permission denied for table life_goals" (and the same error on other tables).
-- The tables had row level security policies, but the "authenticated" role was never
-- granted table access, so Postgres blocked requests before RLS was even checked.
-- RLS policies from 001/004 still limit each user to their own rows.

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_domains      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_goals        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.priority_groups   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_history      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_views       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.change_history    TO authenticated;

-- Needed if any table uses serial/identity ids
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
