# My Life Planner — Setup Guide

## Step 1: Install dependencies

Open a terminal in this folder and run:
```
npm install
```

## Step 2: Run the Supabase database schema

1. Go to your Supabase dashboard → **SQL Editor**
2. Open the file `supabase/migrations/001_initial_schema.sql`
3. Paste the entire contents into the SQL editor and click **Run**

## Step 3: Enable Google Auth in Supabase (optional)

1. Supabase dashboard → **Authentication** → **Providers** → **Google**
2. Enable it and add your Google OAuth credentials
3. Add `http://localhost:3000/auth/callback` as an allowed redirect URL

## Step 4: Run locally

```
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 5: Push to GitHub

```
git init
git remote add origin https://github.com/smithdnv/My-Life-Planner.git
git add .
git commit -m "Initial scaffold — Phase 1"
git push -u origin main
```

## Step 6: Deploy to Vercel

1. Go to vercel.com → **New Project** → Import your GitHub repo
2. Add these environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `ANTHROPIC_API_KEY`
3. Deploy — Vercel auto-deploys on every push to main

## Step 7: Connect your domain

In DreamHost, add a CNAME record:
- Host: `app` (or whatever subdomain you chose)
- Points to: `cname.vercel-dns.com`

In Vercel project settings → **Domains**, add `app.charishousenetwork.com`.

---

## What's built in Phase 1

- Landing page with sign up / sign in
- Google OAuth + email/password auth
- AI-powered life goal discovery (chat interface)
- Life domains (Faith, Health, Family, Career, etc.)
- Projects with A–Z priority groups and numbered priorities
- Cross-project Top Priorities view
- Show/hide completed tasks
- Dashboard with today's top priorities
- PWA manifest (installable on Android + iPhone)
- Full database schema with Row Level Security
- Auto-creates default domains and priority groups on signup

## What's coming in Phase 2

- Project detail page with task management
- Drag-to-reprioritize
- Change history + undo
- Family workspace and member invites
- Email notifications (daily digest)
- Google Calendar sync
- AI task prioritization suggestions
- Kanban and calendar views
