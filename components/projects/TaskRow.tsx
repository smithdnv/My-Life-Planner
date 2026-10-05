'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TaskRow({
  task,
  onUpdated,
  onDeleted,
}: {
  task: any
  onUpdated: (task: any) => void
  onDeleted: (taskId: string) => void
}) {
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? '',
    priority_group: task.priority_group,
    priority_number: task.priority_number,
    due_date: task.due_date ?? '',
  })

  const isCompleted = task.status === 'completed'

  function toggleComplete() {
    const newStatus = isCompleted ? 'pending' : 'completed'
    const optimistic = {
      ...task,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    }
    onUpdated(optimistic)

    startTransition(async () => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', task.id)
        .select()
        .single()

      if (!error && data) onUpdated(data)
    })
  }

  function saveEdit() {
    startTransition(async () => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: form.title,
          description: form.description || null,
          priority_group: form.priority_group,
          priority_number: Number(form.priority_number),
          due_date: form.due_date || null,
        })
        .eq('id', task.id)
        .select()
        .single()

      if (!error && data) {
        onUpdated(data)
        setEditing(false)
      }
    })
  }

  function deleteTask() {
    if (!confirm(`Delete "${task.title}"?`)) return
    startTransition(async () => {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id)
      if (!error) onDeleted(task.id)
    })
  }

  if (editing) {
    return (
      <div className="card p-4 space-y-2">
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Task title"
        />
        <textarea
          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="flex gap-2">
          <select
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
            value={form.priority_group}
            onChange={(e) => setForm((f) => ({ ...f, priority_group: e.target.value }))}
          >
            {['A', 'B', 'C'].map((g) => (
              <option key={g} value={g}>Group {g}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
            value={form.priority_number}
            onChange={(e) => setForm((f) => ({ ...f, priority_number: e.target.value }))}
          />
          <input
            type="date"
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={saveEdit}
            disabled={isPending}
            className="bg-primary-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 flex items-start gap-3 group">
      <button
        onClick={toggleComplete}
        disabled={isPending}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
          isCompleted ? 'bg-primary-500 border-primary-500' : 'border-slate-300 hover:border-primary-400'
        }`}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {isCompleted && <span className="text-white text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`priority-badge priority-${task.priority_group} text-xs`}>
            {task.priority_group}{task.priority_number}
          </span>
          <p className={`font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
            {task.title}
          </p>
        </div>
        {task.description && (
          <p className="text-sm text-slate-500 mt-1">{task.description}</p>
        )}
        {task.due_date && (
          <p className="text-xs text-slate-400 mt-1">
            📅 Due {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={deleteTask}
          disabled={isPending}
          className="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
