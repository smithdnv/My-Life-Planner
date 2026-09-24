'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_UNDO_LIMIT = 50

export type EntityType = 'task' | 'project' | 'goal' | 'domain' | 'profile'
export type ChangeAction = 'created' | 'updated' | 'deleted'

export interface ChangeEntry {
  id: string
  entityType: EntityType
  entityId: string
  action: ChangeAction
  fieldChanged?: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
  description: string
  isUndone: boolean
  createdAt: string
}

interface RecordParams {
  entityType: EntityType
  entityId: string
  action: ChangeAction
  fieldChanged?: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
  description: string
}

interface UndoResult {
  entry: ChangeEntry
  restoredState: Record<string, unknown> | undefined
}

// ─────────────────────────────────────────────────────────────
// useChangeHistory
//
// Manages the undo stack, synced to Supabase change_history.
// The in-memory stack is capped at `undoLimit` (default 50).
//
// Usage:
//   const { record, undo, canUndo, history } = useChangeHistory(userId)
//
//   // Before mutating, capture before state:
//   const before = { ...task }
//   await supabase.from('tasks').update({ title: newTitle })
//   await record({ entityType: 'task', entityId: task.id,
//                  action: 'updated', fieldChanged: 'title',
//                  beforeState: before, afterState: { ...task, title: newTitle },
//                  description: `Changed task title to "${newTitle}"` })
//
//   // To undo:
//   const result = await undo()
//   if (result) await applyStateToSupabase(result.entry.entityType, result.restoredState)
// ─────────────────────────────────────────────────────────────

export function useChangeHistory(userId: string | null, undoLimit = DEFAULT_UNDO_LIMIT) {
  const [history, setHistory] = useState<ChangeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const limitRef = useRef(undoLimit)
  useEffect(() => { limitRef.current = undoLimit }, [undoLimit])

  // Load recent history on mount
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('change_history')
      .select('*')
      .eq('user_id', userId)
      .eq('is_undone', false)
      .order('created_at', { ascending: false })
      .limit(limitRef.current)
      .then(({ data }) => {
        if (data) {
          setHistory(data.map(row => ({
            id: row.id,
            entityType: row.entity_type as EntityType,
            entityId: row.entity_id,
            action: row.action as ChangeAction,
            fieldChanged: row.field_changed ?? undefined,
            beforeState: row.before_state ?? undefined,
            afterState: row.after_state ?? undefined,
            description: row.description,
            isUndone: row.is_undone,
            createdAt: row.created_at,
          })))
        }
        setLoading(false)
      })
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Record a change (call AFTER the mutation succeeds)
  const record = useCallback(async (params: RecordParams): Promise<void> => {
    if (!userId) return

    const { data, error } = await supabase
      .from('change_history')
      .insert({
        user_id: userId,
        entity_type: params.entityType,
        entity_id: params.entityId,
        action: params.action,
        field_changed: params.fieldChanged ?? null,
        before_state: params.beforeState ?? null,
        after_state: params.afterState ?? null,
        description: params.description,
        is_undone: false,
      })
      .select('*')
      .single()

    if (error || !data) return

    const entry: ChangeEntry = {
      id: data.id,
      entityType: data.entity_type as EntityType,
      entityId: data.entity_id,
      action: data.action as ChangeAction,
      fieldChanged: data.field_changed ?? undefined,
      beforeState: data.before_state ?? undefined,
      afterState: data.after_state ?? undefined,
      description: data.description,
      isUndone: false,
      createdAt: data.created_at,
    }

    setHistory(prev => {
      const next = [entry, ...prev]
      // Trim to limit, pruning oldest entries from DB too (fire-and-forget)
      if (next.length > limitRef.current) {
        const pruned = next.splice(limitRef.current)
        pruned.forEach(old => {
          supabase.from('change_history').delete().eq('id', old.id).then(() => {})
        })
      }
      return next
    })
  }, [userId, supabase])

  // Undo the most recent change — returns the entry so the caller can revert the data
  const undo = useCallback(async (): Promise<UndoResult | null> => {
    const entry = history[0]
    if (!entry) return null

    const { error } = await supabase
      .from('change_history')
      .update({ is_undone: true })
      .eq('id', entry.id)

    if (error) return null

    setHistory(prev => prev.slice(1))
    return { entry, restoredState: entry.beforeState }
  }, [history, supabase])

  const canUndo = history.length > 0

  return { history, loading, record, undo, canUndo }
}
