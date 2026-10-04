-- Migration 005: Add design documentation field to projects
-- Run this in Supabase SQL Editor

alter table public.projects
  add column if not exists design_docs text;
