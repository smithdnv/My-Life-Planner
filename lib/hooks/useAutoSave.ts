'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const SAVE_LOG_KEY = 'mlp_failed_saves'
const MAX_LOG_ENTRIES = 100

interface FailedSaveEntry {
  timestamp: string
  entityType: string
  entityId: string
  data: unknown
  error: string
}

function logFailedSave(entry: Omit<FailedSaveEntry, 'timestamp'>) {
  try {
    const raw = localStorage.getItem(SAVE_LOG_KEY)
    const log: FailedSaveEntry[] = raw ? JSON.parse(raw) : []
    log.unshift({ ...entry, timestamp: new Date().toISOString() })
    // Keep only the most recent MAX_LOG_ENTRIES
    if (log.length > MAX_LOG_ENTRIES) log.splice(MAX_LOG_ENTRIES)
    localStorage.setItem(SAVE_LOG_KEY, JSON.stringify(log))
  } catch {
    // localStorage unavailable — silently skip
  }
}

export function getFailedSaveLog(): FailedSaveEntry[] {
  try {
    const raw = localStorage.getItem(SAVE_LOG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearFailedSaveLog() {
  try { localStorage.removeItem(SAVE_LOG_KEY) } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────
// useAutoSave
//
// Usage:
//   const { saving, lastSaved, error } = useAutoSave({
//     value: taskData,
//     saveFn: async (data) => { await supabase.from('tasks').update(data)... },
//     entityType: 'task',
//     entityId: task.id,
//     debounceMs: 500,
//   })
// ─────────────────────────────────────────────────────────────

interface UseAutoSaveOptions<T> {
  value: T
  saveFn: (value: T) => Promise<void>
  entityType: string
  entityId: string
  debounceMs?: number
  enabled?: boolean          // set false to pause auto-save (e.g. during undo)
}

interface AutoSaveState {
  saving: boolean
  lastSaved: Date | null
  error: string | null
  pendingChanges: boolean
}

export function useAutoSave<T>({
  value,
  saveFn,
  entityType,
  entityId,
  debounceMs = 500,
  enabled = true,
}: UseAutoSaveOptions<T>): AutoSaveState {
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingChanges, setPendingChanges] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestValue = useRef<T>(value)
  const isFirstRender = useRef(true)

  // Track latest value for the debounced callback
  useEffect(() => { latestValue.current = value }, [value])

  const doSave = useCallback(async () => {
    setSaving(true)
    setPendingChanges(false)
    setError(null)
    try {
      await saveFn(latestValue.current)
      setLastSaved(new Date())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed'
      setError(message)
      logFailedSave({
        entityType,
        entityId,
        data: latestValue.current,
        error: message,
      })
    } finally {
      setSaving(false)
    }
  }, [saveFn, entityType, entityId])

  useEffect(() => {
    // Skip the very first render — we only want to save on changes
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!enabled) return

    setPendingChanges(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(doSave, debounceMs)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value, enabled, debounceMs, doSave])

  return { saving, lastSaved, error, pendingChanges }
}
