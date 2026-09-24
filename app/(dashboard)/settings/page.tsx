'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getFailedSaveLog, clearFailedSaveLog } from '@/lib/hooks/useAutoSave'

const TABLES = [
  'profiles', 'life_domains', 'life_goals', 'priority_groups',
  'projects', 'tasks', 'task_history', 'change_history',
  'workspaces', 'workspace_members', 'onboarding_sessions',
]

interface TableStats { name: string; rows: number; estBytes: number }
interface ExportData { exported_at: string; tables: Record<string, unknown[]> }

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function SettingsPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [undoLimit, setUndoLimit] = useState(50)
  const [tableStats, setTableStats] = useState<TableStats[]>([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [failedSaves, setFailedSaves] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
    setFailedSaves(getFailedSaveLog().length)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!userId) return
    supabase.from('profiles').select('undo_limit').eq('user_id', userId).single()
      .then(({ data }) => { if (data) setUndoLimit(data.undo_limit ?? 50) })
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadStats() {
    if (!userId) return
    setLoadingStats(true)
    const stats: TableStats[] = []
    for (const table of TABLES) {
      const { data } = await supabase.from(table).select('*').eq('user_id', userId)
      const rows = data?.length ?? 0
      const estBytes = new Blob([JSON.stringify(data ?? [])]).size
      stats.push({ name: table, rows, estBytes })
    }
    setTableStats(stats)
    setLoadingStats(false)
  }

  async function saveSettings() {
    if (!userId) return
    await supabase.from('profiles').update({ undo_limit: undoLimit }).eq('user_id', userId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function exportData() {
    if (!userId) return
    setExporting(true)
    const exportData: ExportData = { exported_at: new Date().toISOString(), tables: {} }
    for (const table of TABLES) {
      const { data } = await supabase.from(table).select('*').eq('user_id', userId)
      exportData.tables[table] = data ?? []
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-life-planner-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const totalBytes = tableStats.reduce((sum, t) => sum + t.estBytes, 0)

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      {/* ── Undo History ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Auto-Save & Undo History</h2>
        <p className="text-slate-500 text-sm mb-4">
          Every change is saved automatically. You can undo up to this many changes.
        </p>
        <div className="flex items-center gap-4">
          <label className="label whitespace-nowrap">Undo history limit</label>
          <input
            type="number" min={10} max={200} step={10}
            className="input w-28"
            value={undoLimit}
            onChange={e => setUndoLimit(Number(e.target.value))}
          />
          <span className="text-slate-400 text-sm">changes (default: 50)</span>
        </div>
        <button onClick={saveSettings} className="btn-primary mt-4 px-5 py-2 text-sm">
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </section>

      {/* ── Failed Save Log ── */}
      {failedSaves > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-1">⚠️ Pending Save Failures</h2>
          <p className="text-amber-700 text-sm mb-3">
            {failedSaves} change{failedSaves !== 1 ? 's' : ''} could not be saved to the cloud and
            were logged locally. This usually means a temporary connection issue. Try refreshing —
            if the problem persists, use Export My Data below to save a local copy.
          </p>
          <button
            onClick={() => { clearFailedSaveLog(); setFailedSaves(0) }}
            className="text-sm text-amber-700 underline hover:text-amber-900"
          >
            Clear log
          </button>
        </section>
      )}

      {/* ── Data Export ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">My Data</h2>
        <p className="text-slate-500 text-sm mb-4">
          Export all your goals, projects, and tasks as a JSON file you can save anywhere.
        </p>

        {tableStats.length === 0 ? (
          <button
            onClick={loadStats}
            disabled={loadingStats}
            className="btn-secondary text-sm px-4 py-2 mr-3"
          >
            {loadingStats ? 'Calculating…' : 'Show data size estimate'}
          </button>
        ) : (
          <div className="mb-4">
            <table className="text-sm w-full">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-1 font-medium">Table</th>
                  <th className="pb-1 font-medium text-right">Rows</th>
                  <th className="pb-1 font-medium text-right">Est. size</th>
                </tr>
              </thead>
              <tbody>
                {tableStats.filter(t => t.rows > 0).map(t => (
                  <tr key={t.name} className="border-b border-slate-50">
                    <td className="py-1 text-slate-600">{t.name}</td>
                    <td className="py-1 text-right text-slate-500">{t.rows}</td>
                    <td className="py-1 text-right text-slate-500">{formatBytes(t.estBytes)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-slate-700">
                  <td className="pt-2">Total</td>
                  <td className="pt-2 text-right">{tableStats.reduce((s, t) => s + t.rows, 0)}</td>
                  <td className="pt-2 text-right">{formatBytes(totalBytes)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <button
          onClick={exportData}
          disabled={exporting}
          className="btn-primary text-sm px-5 py-2"
        >
          {exporting ? 'Exporting…' : '⬇️ Export My Data'}
        </button>
      </section>
    </div>
  )
}
