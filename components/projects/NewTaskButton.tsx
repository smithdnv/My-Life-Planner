'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewTaskButton({
  projectId,
  onCreated,
}: {
  projectId: string
  onCreated: (task: any) => void
}) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority_group: 'A',
    priority_number: 1,
    due_date: '',
  })

  function reset() {
    setForm({ title: '', description: '', priority_group: 'A', priority_number: 1, due_date: '' })
  }

  function createTask() {
    if (!form.title.trim()) return

    startTransition(async () => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title: form.title,
          description: form.description || null,
          priority_group: form.priority_group,
          priority_number: Number(form.priority_number),
          due_date: form.due_date || null,
          status: 'pending',
        })
        .select()
        .single()

      if (!error && data) {
        onCreated(data)
        reset()
        setOpen(false)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-primary-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
      >
        + New Task
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="card p-5 w-full max-w-md space-y-3">
        <h3 className="font-semibold text-slate-900">New Task</h3>
        <input
          autoFocus
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <textarea
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          placeholder="Description (optional)"
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="flex gap-2">
          <select
            className="border border-slate-200 rounded-lg px-2 py-2 text-sm"
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
            className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-sm"
            value={form.priority_number}
            onChange={(e) => setForm((f) => ({ ...f, priority_number: e.target.value }))}
          />
          <input
            type="date"
            className="flex-1 border border-slate-200 rounded-lg px-2 py-2 text-sm"
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={createTask}
            disabled={isPending || !form.title.trim()}
            className="bg-primary-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            Create Task
          </button>
          <button
            onClick={() => { setOpen(false); reset() }}
            className="text-sm text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
