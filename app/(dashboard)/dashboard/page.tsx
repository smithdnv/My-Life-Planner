import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: goals }, { data: tasks }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('life_goals').select('*, life_domains(*)').eq('user_id', user.id).eq('status', 'active').order('sort_order'),
    supabase.from('tasks')
      .select('*, projects(title, user_id)')
      .eq('projects.user_id', user.id)
      .neq('status', 'completed')
      .eq('priority_group', 'A')
      .order('priority_number')
      .limit(10),
  ])

  // Redirect to onboarding if not done
  if (profile && !profile.onboarding_completed) redirect('/onboarding')

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{greeting}, {firstName}! 👋</h1>
        <p className="text-slate-500 mt-1">Here's your life at a glance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Top Priorities */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">⚡ Today's Top Priorities</h2>
            <Link href="/priorities" className="text-sm text-primary-600 hover:underline">See all</Link>
          </div>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 group">
                  <button className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-primary-500 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.projects?.title}</p>
                  </div>
                  <span className={`priority-badge priority-${task.priority_group}`}>
                    {task.priority_group}{task.priority_number}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No A-priority tasks yet.</p>
              <Link href="/projects" className="text-primary-600 text-sm hover:underline mt-1 block">Add a project to get started</Link>
            </div>
          )}
        </div>

        {/* Life Goals Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">🎯 Life Goals</h2>
            <Link href="/goals" className="text-sm text-primary-600 hover:underline">Manage</Link>
          </div>
          {goals && goals.length > 0 ? (
            <div className="space-y-3">
              {goals.slice(0, 5).map((goal: any) => (
                <div key={goal.id} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{goal.life_domains?.icon ?? '🎯'}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{goal.title}</p>
                    <p className="text-xs text-slate-400">{goal.life_domains?.name}</p>
                  </div>
                </div>
              ))}
              {goals.length > 5 && (
                <p className="text-xs text-slate-400 text-center">+{goals.length - 5} more</p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm mb-3">No goals set yet.</p>
              <Link href="/onboarding" className="btn-primary text-sm">
                Discover my goals ✨
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { href: '/projects', icon: '➕', label: 'New project' },
          { href: '/priorities', icon: '📊', label: 'All priorities' },
          { href: '/onboarding', icon: '✨', label: 'Goal discovery' },
          { href: '/goals', icon: '🗺️', label: 'My goals' },
        ].map(a => (
          <Link key={a.href} href={a.href}
            className="card p-4 flex flex-col items-center gap-2 hover:border-primary-200 hover:shadow-md transition-all text-center">
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs font-medium text-slate-600">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
