-- Migration 003: Grant read access to service_role for backup exports
-- Run this in Supabase SQL Editor

GRANT SELECT ON public.profiles           TO service_role;
GRANT SELECT ON public.life_domains       TO service_role;
GRANT SELECT ON public.life_goals         TO service_role;
GRANT SELECT ON public.priority_groups    TO service_role;
GRANT SELECT ON public.projects           TO service_role;
GRANT SELECT ON public.tasks              TO service_role;
GRANT SELECT ON public.task_history       TO service_role;
GRANT SELECT ON public.workspaces         TO service_role;
GRANT SELECT ON public.workspace_members  TO service_role;
GRANT SELECT ON public.onboarding_sessions TO service_role;
GRANT SELECT ON public.saved_views        TO service_role;
