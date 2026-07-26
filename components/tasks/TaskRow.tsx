'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TaskRow({ task, showProject = false }: { task: any; showProject?: boolean }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const completed = task.status === 'completed'

  async function toggleComplete() {
    setLoading(true)
    const newStatus = completed ? 'pending' : 'completed'
    await supabase.from('tasks').update({
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    }).eq('id', task.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${completed ? 'opacity-60' : ''}`}>
      <button
        onClick={toggleComplete}
        disabled={loading}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-slate-300 hover:border-primary-500'
        }`}>
        {completed && <span className="text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-slate-900 ${completed ? 'line-through' : ''}`}>
          {task.title}
        </p>
        {showProject && task.projects?.title && (
          <p className="text-xs text-slate-400 mt-0.5">📋 {task.projects.title}</p>
        )}
        {task.due_date && (
          <p className="text-xs text-slate-400 mt-0.5">
            📅 {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </div>

      <span className={`priority-badge priority-${task.priority_group} flex-shrink-0`}>
        {task.priority_group}{task.priority_number}
      </span>
    </div>
  )
}
