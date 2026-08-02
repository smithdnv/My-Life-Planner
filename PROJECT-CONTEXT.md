# My Life Planner — Project Context for Claude.ai

Paste this into a new Claude.ai conversation to continue working on this project from your phone.

---

## What we're building

A cross-platform **Life Planning app** called "My Life Planner" — a PWA (Progressive Web App) that works in any browser on Windows and Android/iOS with shared cloud data. It starts with AI-guided life goal discovery and cascades down into projects, sub-projects, tasks, and priorities. Built for personal/family use first, with a monetization path later.

## Tech stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend/DB**: Supabase (cloud) — handles auth, real-time sync, PostgreSQL
- **AI**: Claude API (Anthropic) — for goal discovery coaching and task prioritization
- **Hosting**: Local dev on Windows laptop (`npm run dev` at localhost:3000); will deploy to Vercel
- **Repo**: https://github.com/smithdnv/My-Life-Planner
- **Local path**: C:\Users\vsmit\OneDrive\Documents\Doug\my-life-planner
- **Supabase project**: https://rnxaimywzatywqdzgrzj.supabase.co

## What's been built (Phase 1 scaffold)

### App structure
```
app/
  (auth)/login/page.tsx          — Email + Google login
  (auth)/signup/page.tsx         — Signup with Terms of Service checkbox
  (dashboard)/layout.tsx         — Sidebar (desktop) + mobile bottom nav
  (dashboard)/dashboard/page.tsx — Home: today's top priorities + goals summary
  (dashboard)/onboarding/page.tsx — AI life goal discovery chat (auto-saves to Supabase)
  (dashboard)/goals/page.tsx     — Goals organized by life domain
  (dashboard)/projects/page.tsx  — Projects grouped by A-Z priority
  (dashboard)/priorities/page.tsx — Cross-project top priorities view
  api/ai/route.ts                — Claude API endpoint for AI coaching
  api/auth/callback/route.ts     — Supabase OAuth callback
```

### Database (Supabase — both migrations already run)
- `profiles` — user settings, notification time, onboarding status
- `life_domains` — 8 life areas (Faith, Health, Family, Career, Finance, Growth, Hobbies, Community)
- `life_goals` — goals linked to domains, with "why" field
- `priority_groups` — A=Required, B=Should-Do, C=Nice-To-Have (customizable A-Z)
- `projects` — nested projects with priority group + number
- `tasks` — tasks with priority, status, due date, assignment
- `task_history` — for undo functionality (Phase 2)
- `workspaces` + `workspace_members` — family collaboration
- `onboarding_sessions` — saves the full AI chat conversation so it survives navigation

### Key features working
- Landing page, login, signup (email + Google OAuth)
- AI life goal discovery chat — **auto-saves every message to Supabase**; conversation restores on return
- Goals saved to Supabase when user clicks "Save this goal"
- 8 default life domains created automatically on signup
- Default priority groups (A, B, C) created on signup
- Dashboard with today's top A-priority tasks
- Projects list grouped by priority group
- Cross-project Top Priorities view with group filter
- Show/hide completed tasks toggle
- PWA manifest (installable on phone)
- Row Level Security on all tables

## Roles (family collaboration — Phase 2)
| Role | Permissions |
|------|-------------|
| Owner | Everything including billing |
| Co-owner | Everything except delete owner account |
| Full Control | Full edit/delete, no role management |
| Basic Editor | Add/update tasks, no delete |
| Viewer | Read only |

## Priority system
- Groups A–Z (customizable names), numbers within each group (A1, A2, B1, etc.)
- Auto-sorts Group A first by number, then B, etc.
- AI can suggest prioritization with reasoning
- Badge display (e.g. "A1") on every task

## Backup workflow
- Code: run `git-save "message"` from project folder in Command Prompt — commits + pushes to GitHub + exports Supabase DB
- User data: Supabase cloud (free tier — no automatic backups; `git-save` exports a SQL dump to `backups/supabase-YYYY-MM-DD.sql`)
- First run `npx supabase login` once before git-save database exports will work

## Known issues / things to watch
- `next.config.ts` doesn't work — must use `next.config.js` with `module.exports = {}`
- `npm install` requires `--legacy-peer-deps` flag due to React 19 peer dep conflicts
- After `npm install next@15 --legacy-peer-deps`, also run `npm install autoprefixer --legacy-peer-deps`
- Git lock files can go stale when Claude edits files — the `git-save.bat` script handles this automatically
- Supabase free tier has no automatic backups — rely on `git-save` SQL exports

## What's NOT built yet (Phase 2)
- Project detail page (view/add/edit/delete tasks inside a project) ← **next priority**
- Drag-to-reprioritize tasks
- Change history + selective undo
- Family workspace invites and member management
- Email notifications (daily digest at 8am with friendly tone)
- Google Calendar integration
- AI task prioritization suggestions (with reasoning popup)
- AI "what should I work on right now/on [date]?" with prerequisite detection
- Kanban and calendar views
- Recurring tasks
- Progress bars and wins log

## Next step
Build the **project detail page** at `app/(dashboard)/projects/[id]/page.tsx` — this is where users view, add, edit, reorder, and complete tasks within a specific project, with the full A-Z priority system.

## Owner info
- Name: Doug (smithdnv@gmail.com)
- Family: wife + youngest daughter (Android); older married kids (iOS) — all will use the app
- Target: working Phase 1 prototype by end of July 2026, polished by mid-August 2026

---

*Note: In Cowork desktop mode, Claude can directly edit files in the project folder. On Claude.ai (web/mobile), Claude will need to provide code for you to copy-paste into the files manually.*
