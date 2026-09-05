# My Life Planner — Software Prerequisites

Everything you need installed before you can run or develop this app.

---

## Required Software

### 1. Node.js (v18 or later — v24 recommended)
The JavaScript runtime that powers the app and all build tools.

- Download: https://nodejs.org/ → click **"LTS"**
- During install: check **"Add to PATH"** and optionally **"Install Python and Visual Studio Build Tools"** (needed for some native packages)
- Verify: open Command Prompt and run `node --version` and `npm --version`

> Note: Use **Command Prompt** (not PowerShell) for all commands in this project. npm may not be found in PowerShell.

---

### 2. Git
Version control — used to save and sync code to GitHub.

- Download: https://git-scm.com/download/win
- During install: accept defaults; make sure **"Git from the command line"** is selected
- Verify: `git --version`

---

### 3. PostgreSQL Client Tools (for database backups)
Provides `pg_dump` for exporting the database. You do **not** need the full PostgreSQL server.

- Download: https://www.postgresql.org/download/windows/
- Click **"Download the installer"** → choose latest version
- During install: uncheck **"PostgreSQL Server"** and **"pgAdmin"**; keep only **"Command Line Tools"**
- Verify: open a new Command Prompt and run `pg_dump --version`

---

### 4. A Code Editor
For editing source files.

- **VS Code** (recommended): https://code.visualstudio.com/
  - Suggested extensions: ESLint, Tailwind CSS IntelliSense, Prettier, GitLens
- Any text editor works, but VS Code has the best TypeScript and Next.js support

---

## Required Accounts & Services

### Supabase (free tier)
Handles the database, authentication, and real-time sync.
- Sign up: https://supabase.com
- After creating a project, you need these values (found in Project Settings → API):
  - Project URL
  - Publishable key
  - Secret key

### GitHub
Stores the code and enables deployment via Vercel.
- Sign up: https://github.com
- Create a repo and connect it to your local project (see SETUP.md)

### Vercel (free tier)
Hosts the app and auto-deploys on every push to GitHub.
- Sign up: https://vercel.com (sign in with GitHub for easiest setup)

### Anthropic (Claude API)
Powers the AI life goal discovery chat.
- Sign up: https://console.anthropic.com
- Create an API key under Account → API Keys

---

## Required Environment Variables

These must be set before running or deploying the app.

### Local development (.env.local in the project root)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
ANTHROPIC_API_KEY=sk-ant-...
```

### Windows environment variables (set once via Command Prompt, then reopen)
Used by the `git-save` backup script:
```
setx SUPABASE_SECRET_KEY "sb_secret_..."
setx SUPABASE_DB_PASSWORD "your-database-password"
```
Find these in Supabase → Project Settings → API (secret key) and → Database (password).

---

## Known Issues & Workarounds

| Issue | Fix |
|-------|-----|
| `npm not found` in PowerShell | Use **Command Prompt** instead |
| `npm install` fails with peer dep errors | Always use `npm install --legacy-peer-deps` |
| `next.config.ts not supported` error | Use `next.config.js` with `module.exports = {}` |
| `Cannot find module 'autoprefixer'` | Run `npm install autoprefixer --legacy-peer-deps` |
| Git `fatal: cannot lock ref` error | Run `git-save` (it clears stale lock files automatically) |
| Supabase backup needs pg_dump | Install PostgreSQL **Command Line Tools** only (no server needed) |

---

## Version Reference

Versions confirmed working as of August 2026:

| Software | Version |
|----------|---------|
| Node.js | v24.18.0 |
| npm | v11.16.0 |
| Next.js | 15 |
| PostgreSQL client tools | 18 |
| Git | any recent version |
