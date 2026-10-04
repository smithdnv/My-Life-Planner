'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Project, Task } from '@/types'
import { useAutoSave } from '@/lib/hooks/useAutoSave'
import { AutoSaveIndicator } from '@/components/ui/AutoSaveIndicator'

type TaskStatus = 'pending' | 'in_progress' | 'completed'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState('')
  const [designDocs, setDesignDocs] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const newTaskRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: proj } = await supabase
        .from('projects')
        .select('*, life_goals(title, life_domains(name, icon, color))')
        .eq('id', id)
        .single()

      if (!proj) { router.push('/projects'); return }
      setProject(proj)
      setDescription(proj.description ?? '')
      setDesignDocs(proj.design_docs ?? '')

      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('priority_group')
        .order('priority_number')
        .order('sort_order')

      setTasks(taskData ?? [])
      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save description + design docs
  const saveProject = async (data: { description: string; design_docs: string }) => {
    await supabase.from('projects').update({
      description: data.description,
      design_docs: data.design_docs,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
  }

  const autoSave = useAutoSave({
    value: { description, design_docs: designDocs },
    saveFn: saveProject,
    entityType: 'project',
    entityId: id,
    debounceMs: 800,
  })

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    setAddingTask(true)

    const { data } = await supabase.from('tasks').insert({
      project_id: id,
      title: newTaskTitle.trim(),
      priority_group: 'B',
      priority_number: tasks.filter(t => t.priority_group === 'B').length + 1,
      status: 'pending',
      time_horizon: 'weekly',
      sort_order: tasks.length,
    }).select('*').single()

    if (data) setTasks(prev => [...prev, data])
    setNewTaskTitle('')
    setAddingTask(false)
    newTaskRef.current?.focus()
  }

  async function toggleTask(task: Task) {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed'
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null

    await supabase.from('tasks').update({
      status: newStatus,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    }).eq('id', task.id)

    setTasks(prev => prev.map(t => t.id === task.id
      ? { ...t, status: newStatus, completed_at: completedAt ?? undefined }
      : t
    ))
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-400">Loading…</p>
    </div>
  )

  if (!project) return null

  const activeTasks = tasks.filter(t => t.status !== 'completed')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const visibleTasks = showCompleted ? tasks : activeTasks
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  const goal = (project as any).life_goals
  const domain = goal?.life_domains

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">

      {/* Back + header */}
      <div>
        <Link href="/projects" className="text-sm text-slate-400 hover:text-slate-600">← Projects</Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`priority-badge priority-${project.priority_group}`}>
                {project.priority_group}{project.priority_number}
              </span>
              {domain && (
                <span className="text-sm text-slate-500">
                  {domain.icon} {domain.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
            {goal && (
              <p className="text-sm text-slate-400 mt-1">Goal: {goal.title}</p>
            )}
          </div>
          <AutoSaveIndicator {...autoSave} className="mt-1" />
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{completedTasks.length}/{tasks.length} tasks complete</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <section className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-2">📝 Description</h2>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What is this project about? What does success look like?"
          className="input w-full resize-none min-h-[100px]"
          rows={4}
        />
      </section>

      {/* Design Documentation */}
      <section className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-1">📐 Design & Documentation</h2>
        <p className="text-xs text-slate-400 mb-2">
          Plans, links, notes, requirements — anything that helps define this project in detail.
        </p>
        <textarea
          value={designDocs}
          onChange={e => setDesignDocs(e.target.value)}
          placeholder="Paste links, outline plans, add technical notes, requirements, or any documentation for this project…"
          className="input w-full resize-none min-h-[140px] font-mono text-sm"
          rows={6}
        />
      </section>

      {/* Tasks */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">✅ Tasks</h2>
          {completedTasks.length > 0 && (
            <button
              onClick={() => setShowCompleted(s => !s)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              {showCompleted ? 'Hide' : 'Show'} {completedTasks.length} completed
            </button>
          )}
        </div>

        {/* Add task */}
        <form onSubmit={addTask} className="flex gap-2 mb-4">
          <input
            ref={newTaskRef}
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a task…"
            className="input flex-1 text-sm"
            disabled={addingTask}
          />
          <button type="submit" disabled={addingTask || !newTaskTitle.trim()} className="btn-primary px-4 text-sm">
            Add
          </button>
        </form>

        {/* Task list */}
        {visibleTasks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            {tasks.length === 0 ? 'No tasks yet. Add one above.' : 'All tasks complete! 🎉'}
          </p>
        ) : (
          <div className="space-y-1">
            {visibleTasks.map(task => (
              <div key={task.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group hover:bg-slate-50 ${
                  task.status === 'completed' ? 'opacity-50' : ''
                }`}>
                <button
                  onClick={() => toggleTask(task)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 hover:border-primary-500'
                  }`}
                >
                  {task.status === 'completed' && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </span>
                </div>
                <span className={`priority-badge priority-${task.priority_group} text-xs`}>
                  {task.priority_group}{task.priority_number}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 text-lg leading-none transition-all"
                  title="Delete task"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
