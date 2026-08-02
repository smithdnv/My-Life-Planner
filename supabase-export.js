#!/usr/bin/env node
// Exports all Supabase table data to a JSON backup file via the REST API.
// No PostgreSQL connection or Docker required.
//
// Usage:   node supabase-export.js <output-file>
// Requires: SUPABASE_SECRET_KEY environment variable

const fs   = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://rnxaimywzatywqdzgrzj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const outputFile   = process.argv[2];

if (!SUPABASE_KEY) {
  console.error('[ERROR] SUPABASE_SECRET_KEY environment variable not set.');
  console.error('Run once in Command Prompt, then reopen it:');
  console.error('  setx SUPABASE_SECRET_KEY "your-secret-key"');
  console.error('Find it: Supabase dashboard -> Project Settings -> API -> Secret key');
  process.exit(1);
}

if (!outputFile) {
  console.error('[ERROR] Output file path required as first argument.');
  process.exit(1);
}

const TABLES = [
  'profiles',
  'life_domains',
  'life_goals',
  'priority_groups',
  'projects',
  'tasks',
  'task_history',
  'workspaces',
  'workspace_members',
  'onboarding_sessions',
  'saved_views',
];

async function fetchTable(table) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  const backup = {
    exported_at: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    tables: {},
  };

  let hasError = false;

  for (const table of TABLES) {
    try {
      const rows = await fetchTable(table);
      backup.tables[table] = rows;
      console.log(`  [OK] ${table}: ${rows.length} rows`);
    } catch (err) {
      console.error(`  [WARN] ${table}: ${err.message}`);
      backup.tables[table] = null;
      hasError = true;
    }
  }

  const dir = path.dirname(outputFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(outputFile, JSON.stringify(backup, null, 2));
  const size = fs.statSync(outputFile).size;
  console.log(`  Saved: ${outputFile} (${size} bytes)`);

  process.exit(hasError ? 1 : 0);
}

main().catch(err => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
