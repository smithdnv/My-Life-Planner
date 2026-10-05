'use client'

import { useMemo, useState } from 'react'
import TaskRow from './TaskRow'
import NewTaskButton from './NewTaskButton'

type Task = {
  id: string
  project_id: string
  title: string
  description: string | null
  priority_group: string
  priority_number: number
  status: string
  due_date: string | null
  sort_order: number
  [key: string]: any
}

export default function TaskList({ projectId, initialTasks }: { projectId: string; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showCompleted, setShowCompleted] = useState(true)

  const visibleTasks = useMemo(
    () => (showCompleted ? tasks : tasks.filter((t) => t.status !== 'completed')),
    [tasks, showCompleted]
  )

  const grouped = useMemo(() => {
    return visibleTasks.reduce((acc: Record<string, Task[]>, t) => {
      const g = t.priority_group
      if (!acc[g]) acc[g] = []
      acc[g].push(t)
      return acc
    }, {})
  }, [visibleTasks])

  function handleCreated(task: Task) {
    setTasks((prev) => [...prev, task])
  }

  function handleUpdated(task: Task) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
  }

  function handleDeleted(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">✅ Tasks</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {tasks.length} total{completedCount > 0 ? `, ${completedCount} completed` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded border-slate-300"
            />
            Show completed
          </label>
          <NewTaskButton projectId={projectId} onCreated={handleCreated} />
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-3xl mb-3">✅</p>
          <h3 className="font-semibold text-slate-900 mb-1">No tasks yet</h3>
          <p className="text-slate-500 text-sm mb-5">Add your first task to start making progress on this project.</p>
          <NewTaskButton projectId={projectId} onCreated={handleCreated} />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, groupTasks]) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`priority-badge priority-${group} text-sm px-3 py-1`}>Group {group}</span>
                  <span className="text-slate-400 text-sm">
                    {groupTasks.length} task{groupTasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupTasks
                    .sort((a, b) => a.priority_number - b.priority_number)
                    .map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onUpdated={handleUpdated}
                        onDeleted={handleDeleted}
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
