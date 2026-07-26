import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ShowCompletedToggle from '@/components/tasks/ShowCompletedToggle'
import TaskRow from '@/components/tasks/TaskRow'

export default async function PrioritiesPage({
  searchParams,
}: {
  searchParams: Promise<{ show_completed?: string; group?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const showCompleted = params.show_completed === 'true'
  const filterGroup = params.group

  let query = supabase
    .from('tasks')
    .select('*, projects!inner ( id, title, user_id, priority_group, priority_number )')
    .eq('projects.user_id', user.id)
    .order('priority_group')
    .order('priority_number')

  if (!showCompleted) query = query.neq('status', 'completed')
  if (filterGroup) query = query.eq('priority_group', filterGroup)

  const { data: tasks } = await query

  const grouped = (tasks ?? []).reduce((acc: Record<string, any[]>, t: any) => {
    const g = t.priority_group
    if (!acc[g]) acc[g] = []
    acc[g].push(t)
    return acc
  }, {})

  const groups = ['A','B','C','D','E','F'].filter(g => grouped[g]?.length > 0)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">⚡ Top Priorities</h1>
          <p className="text-slate-500 text-sm mt-1">All tasks across all projects, sorted by priority</p>
        </div>
        <ShowCompletedToggle showCompleted={showCompleted} />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <a href="/priorities" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterGroup ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          All groups
        </a>
        {['A','B','C'].map(g => (
          <a key={g} href={`/priorities?group=${g}`}
            className={`priority-badge priority-${g} px-3 py-1.5 text-sm cursor-pointer ${filterGroup === g ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
            Group {g}
          </a>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">✅</p>
          <h3 className="font-semibold text-slate-900 mb-2">{showCompleted ? 'No tasks found' : 'All caught up!'}</h3>
          <p className="text-slate-500 text-sm">{showCompleted ? 'Add tasks to your projects to see them here.' : 'No incomplete tasks. Great work!'}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(group => (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`priority-badge priority-${group} text-sm px-3 py-1`}>Group {group}</span>
                <span className="text-slate-400 text-sm">{grouped[group].length} task{grouped[group].length !== 1 ? 's' : ''}</span>
              </div>
              <div className="card divide-y divide-slate-100">
                {grouped[group].map((task: any) => (
                  <TaskRow key={task.id} task={task} showProject />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
